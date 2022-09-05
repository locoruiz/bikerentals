import * as functions from "firebase-functions";
import * as express from "express";
import * as cors from "cors";
import * as jwt from "jsonwebtoken";

import {connect} from "./config";
import {encrypt, compare} from "./utils";

import {Bike} from "./entity/Bike";
import {User} from "./entity/User";
import {Reservation} from "./entity/Reservation";

const app = express();
app.use(express.json());
app.use(cors({
  origin: "*",
  methods: "*",
  allowedHeaders: "*",
}));

app.all("*", checkUser);


const JWT_KEY = "roscosoft";

async function checkUser(req, res, next) {
  const nonSecurePaths = ["/", "/login", "/register"];
  if (nonSecurePaths.includes(req.path)) return next();

  const authHeader = req.headers.authorization;
  if (authHeader) {
    const comps = authHeader.split(" ");
    if (comps.length === 2) {
      // Bearer token
      const token = comps[1];
      try {
        const decoded = jwt.verify(token, JWT_KEY) as {id: number};
        const connection = await connect();
        const user = await connection.getRepository(User).findOneBy({
          id: decoded.id,
        });
        if (user) {
          req.user = user;
          return next();
        }
      } catch (e) {
        console.log(e);
      }
    }
  }
  res.status(403).json({message: "Unauthorized"});
}

//* ********************* Users *********************\\
app.get("/users", async (req, res) => {
  try {
    const connection = await connect();
    const repo = connection.getRepository(User);
    const users = await repo.find();
    res.json(users);
  } catch (err) {
    res.status(500).json(err);
  }
});

app.post("/register", async (req, res) => {
  const {username, password} = req.body;

  try {
    const connection = await connect();
    const repo = connection.getRepository(User);

    const usr = await repo.findOneBy({
      username,
    });
    if (usr) {
      return res.status(403).json({message: "Username already in use"});
    }
    const user = new User();
    user.username = username;
    user.password = await encrypt(password);
    user.role = "User";

    const savedUser = await repo.save(user);

    const token = jwt.sign({
      id: savedUser.id,
      username,
      role: user.role,
    }, JWT_KEY);

    return res.json({token, id: savedUser.id, role: user.role});
  } catch (err) {
    return res.status(500).json(err);
  }
});

app.post("/users", async (req, res) => {
  const {username, password, role} = req.body;

  // TODO: check if adm to set the role adm

  try {
    const connection = await connect();
    const repo = connection.getRepository(User);

    const usr = await repo.findOneBy({
      username,
    });
    if (usr) {
      return res.status(403).json({message: "Username already in use"});
    }
    const user = new User();
    user.username = username;
    user.password = await encrypt(password);
    user.role = role ?? "User";

    const savedUser = await repo.save(user);

    return res.json({id: savedUser.id, username, role: savedUser.role});
  } catch (err) {
    return res.status(500).json(err);
  }
});

app.post("/login", async (req, res) => {
  const {username, password} = req.body;
  try {
    const connection = await connect();
    const repo = connection.getRepository(User);
    const user = await repo.createQueryBuilder("user")
        .where("user.username = :username", {username})
        .addSelect("user.password")
        .getOne();

    if (user) {
      // exists
    } else {
      return res.status(403).json({message: "No such user"});
    }

    const match = await compare(password, user.password);
    if (!match) {
      return res.status(403).send("Passwords do not match");
    }

    const token = jwt.sign({id: user.id, username, role: user.role}, JWT_KEY);

    return res.json({token, id: user.id, role: user.role});
  } catch (err) {
    console.log(err);
    return res.status(500).send({message: "Error"});
  }
});

app.put("/users/:id", async (req, res) => {
  try {
    const connection = await connect();
    const repo = connection.getRepository(User);

    const user = await repo.findOneBy({
      id: +req.params.id,
    });

    repo.merge(user, req.body);
    if (req.body.password) {
      user.password = await encrypt(req.body.password);
    }

    const saved = await repo.save(user);
    delete saved.password;
    res.json(saved);
  } catch (err) {
    res.status(500).json(err);
  }
});

app.delete("/users/:id", async (req, res) => {
  try {
    const connection = await connect();
    const repo = connection.getRepository(User);

    const results = repo.delete(+req.params.id);
    res.json(results);
  } catch (err) {
    res.status(500).json(err);
  }
});

app.get("/users/:id/bikes", async (req, res) => {
  try {
    const connection = await connect();
    const raw = await connection.manager.query("select b.id, b.model, b.color,"+
                                        " r.fromDate, r.toDate from bike b,"+
                                        " reservation r where b.id = r.bikeId"+
                                        " and r.userId = "+req.params.id);
    return res.json(raw);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//* ********************* Reservations *********************\\
app.get("/reservations", async (req, res) => {
  try {
    const myReq = req as any;
    const user = myReq.user;
    const connection = await connect();
    const repo = connection.getRepository(Reservation);
    const reservations = await repo.find({
      where: {
        user: user,
      },
      relations: {
        bike: true,
      },
    });
    res.json(reservations);
  } catch (err) {
    res.status(500).json(err);
  }
});

app.post("/reservations", async (req, res) => {
  const {fromDate, toDate, bikeId} = req.body;

  try {
    const connection = await connect();
    const repo = connection.getRepository(Reservation);

    const bike = await connection.getRepository(Bike).findOneBy({
      id: bikeId,
    });
    if (bike === undefined || bike === null) {
      return res.status(404).json({message: "Bike not found"});
    }

    const reservation = new Reservation();
    reservation.fromDate = fromDate;
    reservation.toDate = toDate;
    reservation.bike = bike;
    reservation.user = (req as any).user;
    reservation.rating = 0;

    const saved = await repo.save(reservation);

    return res.json(saved);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

app.put("/rate/:id", async (req, res) => {
  try {
    const connection = await connect();
    const repo = connection.getRepository(Reservation);

    const reservation = await repo.findOne({
      where: {
        id: +req.params.id,
      },
      relations: {
        bike: true,
      },
    });

    if (reservation === undefined || reservation === null) {
      return res.status(404).json({message: "Reservation not found"});
    }

    reservation.rating = req.body.rating;

    await repo.save(reservation);

    // Update bike rating
    const manager = connection.manager;
    const rawData = await manager.query("update bike set rating"+
    " = (select avg(rating) from reservation where"+
    ` bikeId = ${reservation.bike.id} and rating > 0)`+
    ` where id = ${reservation.bike.id}`);

    return res.json(rawData);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

app.delete("/reservations/:id", async (req, res) => {
  try {
    const connection = await connect();
    const repo = connection.getRepository(Reservation);

    const results = await repo.delete(+req.params.id);

    res.json(results);
  } catch (err) {
    res.status(500).json(err);
  }
});

//* ********************* Bikes *********************\\
app.get("/bikes", async (req, res) => {
  try {
    const connection = await connect();
    const bikesRepo = connection.getRepository(Bike);
    const bikes = await bikesRepo.find();

    return res.json(bikes);
  } catch (err) {
    return res.status(500).json(err);
  }
});

app.get("/availableBikes", async (req, res) => {
  try {
    const connection = await connect();
    const {fromDate, toDate} = req.query;
    const sql = " select * from bike where available = 1 "+
    "and id not in (select bikeId from reservation where "+
    `fromDate between '${fromDate}' and '${toDate}' or `+
    `toDate between '${fromDate}' and '${toDate}' or `+
    `('${fromDate}' >= fromDate and '${toDate}' <= toDate))`;
    const manager = connection.manager;
    const rawData = await manager.query(sql);
    return res.json(rawData);
  } catch (err) {
    return res.status(500).json(err);
  }
});

app.get("/bikes/:id/users", async (req, res) => {
  try {
    const connection = await connect();
    const raw = await connection.manager.query("select u.username, "+
    "r.fromDate, r.toDate from user u, reservation r where u.id = "+
    "r.userId and r.bikeId = "+req.params.id);
    return res.json(raw);
  } catch (err) {
    return res.status(500).json(err);
  }
});

app.post("/bikes", async (req, res) => {
  const {model, color, location} = req.body;

  try {
    const connection = await connect();
    const repo = connection.getRepository(Bike);

    const bike = new Bike();
    bike.model = model;
    bike.color = color;
    bike.location = location;
    bike.rating = 0;

    const savedBike = await repo.save(bike);
    res.json(savedBike);
  } catch (err) {
    res.status(500).json(err);
  }
});

app.put("/bikes/:id", async (req, res) => {
  try {
    const connection = await connect();
    const repo = connection.getRepository(Bike);

    const bike = await repo.findOneBy({
      id: +req.params.id,
    });

    repo.merge(bike, req.body);

    const savedBike = await repo.save(bike);
    res.json(savedBike);
  } catch (err) {
    res.status(500).json(err);
  }
});

app.delete("/bikes/:id", async (req, res) => {
  try {
    const connection = await connect();
    const repo = connection.getRepository(Bike);

    const results = repo.delete(+req.params.id);
    
    res.json(results);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// app.listen(8000)

exports.app = functions.https.onRequest(app);

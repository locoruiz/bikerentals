import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import {Bike} from "./Bike";
import {User} from "./User";

@Entity()
export class Reservation extends BaseEntity {
    @PrimaryGeneratedColumn()
      id: number;

    @Column({type: "date"})
      fromDate: string;

    @Column({type: "date"})
      toDate: string;

    @ManyToOne(() => User, (user) => user.reservations, {
      onDelete: "CASCADE",
    })
      user: User;

    @ManyToOne(() => Bike, (bike) => bike.reservations, {
      onDelete: "CASCADE",
    })
      bike: Bike;

    @Column()
      rating: number;
}

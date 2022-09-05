import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import {Reservation} from "./Reservation";

@Entity()
export class Bike extends BaseEntity {
    @PrimaryGeneratedColumn()
      id: number;

    @Column()
      model: string;

    @Column()
      color: string;

    @Column()
      location: string;

    @Column({type: "decimal", precision: 10, scale: 2, default: 0})
      rating: number;

    @OneToMany(() => Reservation, (reservation) => reservation.bike, {
      cascade: true,
    })
      reservations: Reservation[];

    @Column({type: "bool", default: true})
      available: boolean;
}

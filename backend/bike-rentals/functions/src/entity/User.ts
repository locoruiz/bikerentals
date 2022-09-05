import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import {Reservation} from "./Reservation";

@Entity()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
      id: number;

    @Column({unique: true})
      username: string;

    @Column({select: false})
      password: string;

    @Column()
      role: string;

    @OneToMany(() => Reservation, (reservation) => reservation.user, {
      cascade: true,
    })
      reservations: Reservation[];
}

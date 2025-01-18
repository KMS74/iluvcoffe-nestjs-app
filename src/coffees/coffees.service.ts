import { Injectable, NotFoundException } from '@nestjs/common';
import { Coffee } from './entities/coffee.entity';
import { Event } from './entities/event.entity';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto/pagination-query.dto';

@Injectable()
export class CoffeesService {
  constructor(
    @InjectModel(Coffee.name) private readonly coffeeModel: Model<Coffee>,
    @InjectModel(Event.name) private readonly eventModel: Model<Event>,
    @InjectConnection() private readonly connection: Connection,
  ) {}
  findAll(paginationQuery: PaginationQueryDto) {
    const { limit, offset } = paginationQuery;
    return this.coffeeModel.find().skip(offset).limit(limit).exec();
  }

  async findOne(id: string) {
    const coffee = await this.coffeeModel
      .findOne({
        _id: id,
      })
      .exec();
    if (!coffee) {
      throw new NotFoundException(`Coffee #${id} not found`);
    }
    return coffee;
  }

  create(createCoffeeDto: CreateCoffeeDto) {
    const coffee = new this.coffeeModel(createCoffeeDto);
    return coffee.save();
  }

  async update(id: string, updateCoffeeDto: UpdateCoffeeDto) {
    const existingCoffee = await this.findOne(id);
    if (existingCoffee) {
      return this.coffeeModel
        .findByIdAndUpdate(
          { _id: id }, // specifies the document to update by its _id
          { $set: updateCoffeeDto }, // updates the document with the new data
          { new: true }, // returns the updated document
        )
        .exec();
    }
  }

  async remove(id: string) {
    const coffee = await this.findOne(id);
    if (coffee) {
      return this.coffeeModel
        .findOneAndDelete({
          _id: id,
        })
        .exec();
    }
  }

  async recommendCoffee(coffeeId: string) {
    const coffee = await this.findOne(coffeeId);

    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      coffee.recommendations++;
      const recommendedCoffee = await coffee.save();

      const recommendedEvent = new this.eventModel({
        name: 'recommended',
        type: 'coffee',
      });
      await recommendedEvent.save();

      await session.commitTransaction();

      return recommendedCoffee;
    } catch (error) {
      await session.abortTransaction();
    } finally {
      session.endSession();
    }
  }
}

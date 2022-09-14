import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common/exceptions';
import { InjectModel } from '@nestjs/mongoose';
import { Console } from 'console';
import { isValidObjectId, Model } from 'mongoose';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class PokemonService {

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>
  ){
  }

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLowerCase();
    try{
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;
    }catch(e){
      
      this.handleExceptions(e);
    }
    
  }

  findAll(paginationDto: PaginationDto) {
    const {limit = 10, offset = 0} = paginationDto;
    return this.pokemonModel.find()
    .limit(limit)
    .skip(offset)
    .sort({
      no: 1
    })
    .select('-__v');
  }

  async findOne(term: string) {
    let pokemon: Pokemon;
    if(Number.isInteger(parseInt(term))){
      pokemon = await this.pokemonModel.findOne({no: term});
    }
    if( !pokemon && isValidObjectId(term)){
      pokemon = await this.pokemonModel.findById(term);
    }
    if(!pokemon) {
      pokemon = await this.pokemonModel.findOne({name: term.toLocaleLowerCase()})
    }

    if(!pokemon) throw new NotFoundException(`Pokemon with id, name or no "${term}" not found`)
    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    /*let pokemon: Pokemon;
    
    if(isNaN(+term)){
      pokemon = await this.pokemonModel.findOneAndUpdate({no: term}, updatePokemonDto);
    }
    if( !pokemon && isValidObjectId(term)){
      pokemon = await this.pokemonModel.findByIdAndUpdate(term, updatePokemonDto);
    }
    if(!pokemon) {
      pokemon = await this.pokemonModel.findOneAndUpdate({name: term.toLocaleLowerCase()}, updatePokemonDto);
    }

    if(!pokemon) throw new NotFoundException(`Pokemon with id, name or no "${term}" not found`)

    return pokemon;*/
    const pokemon = await this.findOne(term);
    if(updatePokemonDto.name)
      updatePokemonDto.name = updatePokemonDto.name.toLocaleLowerCase();
    try{
      await pokemon.updateOne(updatePokemonDto);
      return {...pokemon.toJSON(), ...updatePokemonDto};
    }catch(e){
      
      this.handleExceptions(e);
    }
    

  }

  async remove(id: string) {
    //const pokemon = await this.findOne(id);
    //pokemon.deleteOne();
    //return {id};
    //const result = await this.pokemonModel.findByIdAndDelete(id);
    const {deletedCount} = await this.pokemonModel.deleteOne({_id: id});
    if(deletedCount === 0 )
      throw new BadRequestException(`Pokemon with id "${id}" not found`);
    return;
  }
  handleExceptions(e: any){
    if(e.code === 11000){
      throw new BadRequestException(`Pokemon exist in db ${JSON.stringify(e.keyValue)}`);
    }
    console.log(e);
    throw new InternalServerErrorException(`Can't create Pokemon - Check server logs`);
  }
}

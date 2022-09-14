import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import axios, {AxiosInstance} from 'axios';
import { Model } from 'mongoose';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { PokeResponse } from './interfaces/poke-response.interface';


@Injectable()
export class SeedService {
  private readonly axios: AxiosInstance = axios;

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly http: AxiosAdapter
  ){
  }

  async executeSeed(){
    await this.pokemonModel.deleteMany({});
    const data = await this.http.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=650');
    /*data.results.forEach(({name, url})=>{
      const segments = url.split('/');
      const no: number = +segments[segments.length - 2];


    });*/
    const res = data.results.map(({name, url})=>{
      const segments = url.split('/');
      const no: number = +segments[segments.length - 2];
      return {name, no};
    });
    console.log(res);
    //await this.pokemonModel.create(res);
    await this.pokemonModel.insertMany(res);
    return data.results;
  }
}

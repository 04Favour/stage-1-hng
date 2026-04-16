import { IsNotEmpty, IsString } from 'class-validator';

export class CreateProfileDto {
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  name!: string;
}

export class FilterProfilesDto {
  gender?: string;
  country_id?: string;
  age_group?: string;
}
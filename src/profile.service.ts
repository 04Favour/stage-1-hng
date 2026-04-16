import { BadGatewayException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from './profile.entity';
import { CreateProfileDto, FilterProfilesDto } from './profile.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepo: Repository<Profile>,
  ) {}

  async create(dto: CreateProfileDto) {
    const name = dto.name.trim().toLowerCase();

  
    const existing = await this.profileRepo.findOne({ where: { name } });
    if (existing) {
      return {
        status: 'success',
        message: 'Profile already exists',
        data: this.format(existing),
      };
    }

    const [genderizeRes, agifyRes, nationalizeRes] = await Promise.all([
      fetch(`https://api.genderize.io?name=${encodeURIComponent(name)}`),
      fetch(`https://api.agify.io?name=${encodeURIComponent(name)}`),
      fetch(`https://api.nationalize.io?name=${encodeURIComponent(name)}`),
    ]);

    if (!genderizeRes.ok) throw new BadGatewayException('Genderize returned an invalid response');
    if (!agifyRes.ok)     throw new BadGatewayException('Agify returned an invalid response');
    if (!nationalizeRes.ok) throw new BadGatewayException('Nationalize returned an invalid response');

    const [genderData, agifyData, nationalizeData] = await Promise.all([
      genderizeRes.json(),
      agifyRes.json(),
      nationalizeRes.json(),
    ]);

    if (!genderData.gender || genderData.count === 0) {
      throw new BadGatewayException('Genderize returned an invalid response');
    }
    if (agifyData.age === null || agifyData.age === undefined) {
      throw new BadGatewayException('Agify returned an invalid response');
    }
    if (!nationalizeData.country || nationalizeData.country.length === 0) {
      throw new BadGatewayException('Nationalize returned an invalid response');
    }

   
    const gender: string = genderData.gender;
    const gender_probability: number = genderData.probability;
    const sample_size: number = genderData.count;

    const age: number = agifyData.age;
    const age_group = this.classifyAge(age);

    const topCountry = nationalizeData.country.reduce((a: any, b: any) =>
      a.probability > b.probability ? a : b
    );
    const country_id: string = topCountry.country_id;
    const country_probability: number = topCountry.probability;

    const profile = this.profileRepo.create({
      id: uuidv4(),
      name,
      gender,
      gender_probability,
      sample_size,
      age,
      age_group,
      country_id,
      country_probability,
    });

    const saved = await this.profileRepo.save(profile);

    return {
      status: 'success',
      data: this.format(saved),
    };
  }

  async findOne(id: string) {
    const profile = await this.profileRepo.findOne({ where: { id } });
    if (!profile) throw new NotFoundException('Profile not found');
    return { status: 'success', data: this.format(profile) };
  }

  async findAll(filters: FilterProfilesDto) {
    const query = this.profileRepo.createQueryBuilder('profile');

    if (filters.gender) {
      query.andWhere('LOWER(profile.gender) = :gender', {
        gender: filters.gender.toLowerCase(),
      });
    }
    if (filters.country_id) {
      query.andWhere('LOWER(profile.country_id) = :country_id', {
        country_id: filters.country_id.toLowerCase(),
      });
    }
    if (filters.age_group) {
      query.andWhere('LOWER(profile.age_group) = :age_group', {
        age_group: filters.age_group.toLowerCase(),
      });
    }

    const profiles = await query.getMany();

    return {
      status: 'success',
      count: profiles.length,
      data: profiles.map((p) => ({
        id: p.id,
        name: p.name,
        gender: p.gender,
        age: p.age,
        age_group: p.age_group,
        country_id: p.country_id,
      })),
    };
  }

  async remove(id: string) {
    const profile = await this.profileRepo.findOne({ where: { id } });
    if (!profile) throw new NotFoundException('Profile not found');
    await this.profileRepo.remove(profile);
  }

  private classifyAge(age: number): string {
    if (age <= 12) return 'child';
    if (age <= 19) return 'teenager';
    if (age <= 59) return 'adult';
    return 'senior';
  }

  private format(p: Profile) {
    return {
      id: p.id,
      name: p.name,
      gender: p.gender,
      gender_probability: p.gender_probability,
      sample_size: p.sample_size,
      age: p.age,
      age_group: p.age_group,
      country_id: p.country_id,
      country_probability: p.country_probability,
      created_at: p.created_at,
    };
  }
}
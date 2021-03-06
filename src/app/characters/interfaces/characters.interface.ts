import { Stats } from './stats.interface';
import { Attributes } from './attributes.interface';
import { Money } from './money.interface';
import { Affects } from './affects.interface';
import { Config } from './config.interface';
import { ArmourRating } from 'src/app/items/interfaces/armourRating.interface';
import { Item } from 'src/app/items/interfaces/item.interface';
import { Equipment } from './equipment.interface';

export interface Character {
    id?: number;
    name: string;
    gender: string;
    race: string;
    className: string;
    inventory: Item[];
    equipped: Equipment;
    level: string;
    description: string;
    alignmentScore: number;
    totalExperience?: number;
    experience?: number;
    experienceToNextLevel?: number;
    stats: Stats;
    maxStats: Stats;
    attributes: Attributes;
    maxAttributes: Attributes;
    targetName?: string;
    armorRating: ArmourRating;
    status: string;
    money?: Money;
    qffects?: Affects;
    config?: Config;
}

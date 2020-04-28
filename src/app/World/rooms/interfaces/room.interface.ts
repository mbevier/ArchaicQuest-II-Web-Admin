
import { Coords } from 'src/app/shared/interfaces/coords.interface';
import { Player } from '@angular/core/esm5/src/render3';
import { RoomExit } from './roomExit.interface';
import { RoomObject } from './roomObject.interface';
import { Mob } from 'src/app/mobs/interfaces/mob.interface';
import { Item } from 'src/app/items/interfaces/item.interface';

export interface Room {
    id?: number;
    areaId?: number;
    title: string;
    description: string;
    exits: RoomExit;
    coords: Coords;
    players: Player[];
    mobs: Mob[];
    items: Item[];
    emotes: string[];
    roomObjects: RoomObject[];
    updateMessage: string;
    instantRepop: boolean;
}

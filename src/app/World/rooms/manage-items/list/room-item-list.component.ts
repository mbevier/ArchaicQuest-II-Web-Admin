import { Component, OnInit, Output, EventEmitter, Input, OnChanges } from '@angular/core';
import { trigger, state, transition, animate, style } from '@angular/animations';
import { Item } from 'src/app/items/interfaces/item.interface';
import { MatDialog } from '@angular/material';
import { ManageContainerItemsComponent } from '../../manage-container-items/manage-container-items.component';
import { ItemSlotEnum } from 'src/app/items/interfaces/item-slot.enum';


@Component({
  selector: 'app-item-list',
    templateUrl: './room-item-list.component.html',
    styleUrls: ['./room-item-list.component.scss'],
    animations: [
        trigger('detailExpand', [
            state('collapsed', style({ height: '0px', minHeight: '0' })),
            state('expanded', style({ height: '*' })),
            transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        ])]
})
export class RoomItemListComponent implements OnInit, OnChanges {
  @Input() data: Item[];

    items: Item[] = [];

    //move
    dataSource = this.data;
    columnsToDisplay = ['name', 'slot', 'level', 'questItem', 'container', 'actions'];
    expandedElement: Item | null;
    constructor(public dialog: MatDialog) { }


    ngOnInit() {
      console.log(this.data)
     }

     ngOnChanges() {
      this.dataSource  = this.data;
    }


    addItem(item: Item) {

        item.slot = this.mapSlot(item.slot);
        let temp = this.dataSource.slice();
        temp.push(JSON.parse(JSON.stringify(item)));
        this.dataSource = temp;
    }


    openDialog(item: Item, index: number): void {
        const dialogRef = this.dialog.open(ManageContainerItemsComponent, {
            width: '450px',
            data: {
                item: item,
                items: this.items,
                containerIndex: index--
            }
        });

        dialogRef.afterClosed().subscribe(result => {


        });
    }


    removeItem(index: number) {
        this.items.splice(index, 1);
    }


    mapSlot(id: number) {
      return ItemSlotEnum[id];
    }


    ngAfterViewInit() {
        this.dataSource = this.data;

    }

    t() {
      console.log("t");
    }



}


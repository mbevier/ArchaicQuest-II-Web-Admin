import { Component, OnInit, ViewChild, NgZone, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Store, select } from '@ngrx/store';
import { FormControl } from '@angular/forms';
import {
    takeWhile,
    take,
    startWith,
    map,
    switchMap,
    debounceTime,
    distinctUntilChanged
} from 'rxjs/operators';
import { ItemType } from '../interfaces/item-type.interface';
import { ItemAppState } from '../state/add-item.state';
import {
    GetItemTypes,
    GetItemSlotTypes,
    GetArmourTypes,
    PostItem,
    PostItemSuccess,
    GetFlags,
    GetWeaponTypes,
    GetDamageTypes,
    GetAttackTypes
} from '../state/add-item.actions';
import {
    getItemTypes,
    getItemSlotTypes,
    getArmourTypes,
    getFlags,
    getWeaponTypes,
    getDamageTypes,
    getAttackTypes
} from '../state/add-item.selector';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { Item } from '../interfaces/item.interface';
import { Observable } from 'rxjs';
import { ItemService } from './add-item.service';
import { ActivatedRoute } from '@angular/router';

@Component({
    templateUrl: './add-item.component.html',
    styleUrls: ['./add-item.component.scss']
})
export class AddItemComponent implements OnDestroy, OnInit {
    componentActive = true;
    addItemForm: FormGroup;
    itemTypes: ItemType[];
    itemSlotTypes: ItemType[];
    armourTypes: ItemType[];
    weaponTypes: ItemType[];
    attackTypes: ItemType[];
    damageTypes: ItemType[];
    flags: ItemType[];
    containerSize: ItemType[];
    containerCanBeOpened = false;
    containerCanBeLocked = false;
    lockStrength: ItemType[];
    pages: number[] = [];
    showWeaponSection = false;
    showArmourSection = false;
    showBookSection = false;
    showContainerSection = false;
    containerItems: Item[] = [];
    options: Item[] = [];
    filteredOptions: Observable<Item[]>;
    findKeyOptions: Observable<Item[]>;
    selectedItem: Item;

    constructor(
        private formBuilder: FormBuilder,
        private ngZone: NgZone,
        private store: Store<ItemAppState>,
        private itemService: ItemService,
        private route: ActivatedRoute
    ) { }
    @ViewChild('autosize')
    autosize: CdkTextareaAutosize;

    ngOnInit() {



        this.addItemForm = this.formBuilder.group({
            name: ['', Validators.required],
            knownByName: [''],
            itemType: [''],
            itemSlotType: [''],
            minLevel: [''],
            weaponType: [''],
            attackType: [''],
            damageType: [''],
            minDamage: ['', [Validators.min(1), Validators.max(50)]],
            maxDamage: ['', [Validators.min(1), Validators.max(100)]],
            armourType: [''],
            acPierce: [''],
            acBash: [''],
            acSlash: [''],
            acMagic: [''],
            hitRoll: [''],
            damRoll: [''],
            saves: [''],
            hpMod: [''],
            manaMod: [''],
            movesMod: [''],
            spellMod: [''],
            pageCount: [''],
            pages: new FormGroup({}),
            flags: new FormGroup({}),
            lookDescription: ['', Validators.required],
            roomDescription: [''],
            examDescription: [''],
            smellDescription: [''],
            touchDescription: [''],
            tasteDescription: [''],
            selectContainerItem: [''],
            containerOpen: [''],
            containerLocked: [''],
            containerCanLock: [''],
            containerCanOpen: [''],
            lockStrength: [''],
            containerSize: [''],
            selectContainerKey: ['']
        });

        this.filteredOptions = this.addItemForm
            .get('selectContainerItem')
            .valueChanges.pipe(
                startWith(''),
                debounceTime(200),
                distinctUntilChanged(),
                switchMap(name => {
                    if (typeof name !== 'string' || name == null) {
                        return;
                    }
                    return this._filter(name);
                })
            );

        this.findKeyOptions = this.addItemForm
            .get('selectContainerKey')
            .valueChanges.pipe(
                startWith(''),
                debounceTime(200),
                distinctUntilChanged(),
                switchMap(name => {
                    if (typeof name !== 'string' || name == null) {
                        return;
                    }
                    return this._filterKeys(name);
                })
            );

        this.addItemForm.get('itemType').valueChanges.subscribe(value => {
            this.toggleItemSection(value);
        });

        this.addItemForm.get('containerCanOpen').valueChanges.subscribe(value => {
            this.containerCanBeOpened = !this.containerCanBeOpened;
            if (!this.containerCanBeOpened) {
                this.addItemForm.get('containerOpen').setValue(false);
            }
        });

        this.addItemForm.get('containerCanLock').valueChanges.subscribe(value => {
            this.containerCanBeLocked = !this.containerCanBeLocked;
            if (!this.containerCanBeOpened) {
                this.addItemForm.get('containerLocked').setValue(false);
            }
        });

        this.store.dispatch(new GetItemTypes());
        this.store.dispatch(new GetItemSlotTypes());
        this.store.dispatch(new GetArmourTypes());
        this.store.dispatch(new GetWeaponTypes());
        this.store.dispatch(new GetAttackTypes());
        this.store.dispatch(new GetDamageTypes());
        this.store.dispatch(new GetFlags());

        this.store
            .pipe(
                select(getItemTypes),
                takeWhile(() => this.componentActive)
            )
            .subscribe((itemTypes: any) => {
                this.itemTypes = itemTypes;
            });

        this.store
            .pipe(
                select(getItemSlotTypes),
                takeWhile(() => this.componentActive)
            )
            .subscribe((slotTypes: any) => {
                this.itemSlotTypes = slotTypes;
            });

        this.store
            .pipe(
                select(getArmourTypes),
                takeWhile(() => this.componentActive)
            )
            .subscribe((ArmourTypes: ItemType[]) => {
                this.armourTypes = ArmourTypes;
            });

        this.store
            .pipe(
                select(getWeaponTypes),
                takeWhile(() => this.componentActive)
            )
            .subscribe((WeaponTypes: ItemType[]) => {
                this.weaponTypes = WeaponTypes;
            });

        this.store
            .pipe(
                select(getDamageTypes),
                takeWhile(() => this.componentActive)
            )
            .subscribe((damageTypes: ItemType[]) => {
                this.damageTypes = damageTypes;
            });

        this.store
            .pipe(
                select(getAttackTypes),
                takeWhile(() => this.componentActive)
            )
            .subscribe((attackTypes: ItemType[]) => {
                this.attackTypes = attackTypes;
            });

        this.store
            .pipe(
                select(getFlags),
                takeWhile(() => this.componentActive)
            )
            .subscribe((flagArr: ItemType[]) => {
                this.flags = flagArr;

                this.flags.forEach(flag => {
                    (this.addItemForm.controls['flags'] as FormGroup).addControl(
                        flag.name,
                        new FormControl()
                    );
                });
                //  console.log(this.addItemForm)
            });

        this.itemService.getContainerSize().subscribe(containerSizeData => {
            this.containerSize = containerSizeData;
        });

        this.itemService.getLockStrength().subscribe(lockStrengthData => {
            this.lockStrength = lockStrengthData;
        });


        this.itemService.findItemById(this.route.snapshot.params['id']).subscribe(item => {
            this.selectedItem = item;

            this.selectedItem.description = item.description;
            console.log(item.description)
            this.addItemForm.patchValue({
                name: item.name,
                knownByName: item.knownByName,
                itemType: item.itemType,
                itemSlotType: item.slot,
                minLevel: item.minLevel,
                weaponType: item.weaponType,
                attackType: item.attackType,
                damageType: item.damageType,
                minDamage: item.damage ? item.damage.DieSize : 0,
                maxDamage: item.damage ? item.damage.DieSize : 0,
                //  armourType: item.armourR,
                acPierce: item.armourRating ? item.armourRating.armour : 0,
                acBash: item.armourRating ? item.armourRating.armour : 0,
                acSlash: item.armourRating ? item.armourRating.armour : 0,
                acMagic: item.armourRating ? item.armourRating.magic : 0,
                //  hitRol:,
                // damRoll: [''],
                // saves: [''],
                // hpMod: [''],
                // manaMod: [''],
                // movesMod: [''],
                // spellMod: [''],
                // pageCount: [''],
                //  pages: item.,
                flags: item.itemFlags ? item.itemFlags : [],
                lookDescription: item.description.Look,
                roomDescription: item.description.Room,
                examDescription: item.description.Exam,
                smellDescription: item.description.Smell,
                touchDescription: item.description.Touch,
                tasteDescription: item.description.Taste,
                selectContainerItem: item.container ? item.container.items : null,
                containerOpen: item.container ? item.container.isOpen : false,
                containerLocked: item.container ? item.container.isLocked : false,
                containerCanLock: item.container ? item.container.canLock : false,
                containerCanOpen: item.container ? item.container.canOpen : false,
                lockStrength: item.container ? item.container.LockDifficulty : 0,
                containerSize: item.container ? item.container.size : 0,
                selectContainerKey: item.container ? item.container.associatedKeyId : ''
            });
        });
        this.addPage();
    }

    private _filter(value: string): Observable<Item[]> {
        return this.itemService.autocompleteItems(value);
    }

    private _filterKeys(value: string): Observable<Item[]> {
        return this.itemService.findKeyItems(value);
    }

    displayFn(item?: Item): string | undefined {
        console.log('f', item);
        return item != null ? item.name : undefined;
    }

    displayKeys(item?: Item): string | undefined {

        console.log('hello', item);
        return item != null ? item.name : undefined;
    }

    get getFlagControl(): FormArray {
        return this.addItemForm.get('flags') as FormArray;
    }

    get getPageControl(): FormArray {
        return this.addItemForm.get('pages') as FormArray;
    }

    addFlag() {
        this.getFlagControl.push(this.formBuilder.control(''));
    }

    addPage() {

        this.pages.push(1);
        let i = 0;
        this.pages.forEach(() => {
            (this.addItemForm.controls['pages'] as FormGroup).addControl(
                `page${i}`,
                new FormControl()
            );
            i++;
        });
    }

    addItemToContainer() {
        const item = this.addItemForm.get('selectContainerItem').value;
        if (item == null) {
            return;
        }

        this.containerItems = this.containerItems.concat(item);
    }

    removeItemFromContainer(index: number) {
        this.containerItems.splice(index, 1);
    }

    ngOnDestroy(): void {
        this.componentActive = false;
    }

    triggerResize() {
        // Wait for changes to be applied, then trigger textarea resize.
        this.ngZone.onStable
            .pipe(take(1))
            .subscribe(() => this.autosize.resizeToFitContent(true));
    }

    toggleItemSection(event: string) {
        const itemType = event;

        this.addItemForm.get('armourType').disable();
        this.showArmourSection = false;
        this.addItemForm.get('weaponType').disable();
        this.addItemForm.get('attackType').disable();
        this.showWeaponSection = false;
        this.showBookSection = false;
        this.addItemForm.get('pageCount').disable();
        this.showContainerSection = false;

        this.addItemForm.updateValueAndValidity();

        if (itemType === 'Armour') {
            this.showArmourSection = true;
            this.addItemForm.get('armourType').enable();
        } else if (itemType === 'Weapon') {
            this.showWeaponSection = true;
            this.addItemForm.get('weaponType').enable();
            this.addItemForm.get('attackType').enable();
        } else if (itemType === 'Book') {
            this.showBookSection = true;
            this.addItemForm.get('pageCount').enable();
        } else if (itemType === 'Container') {
            this.showContainerSection = true;
        }
    }

    addItem() {
        const pages: string[] = [];

        Object.keys(this.addItemForm.get('pages').value).forEach(page => {
            console.log(this.addItemForm.get('pages').value[page]);
            pages.push(this.addItemForm.get('pages').value[page]);
        });
        console.log(this.addItemForm.get('roomDescription').value);
        const item: Item = {
            name: this.addItemForm.get('name').value,
            knownByName: this.addItemForm.get('knownByName').value || false,
            itemType: this.addItemForm.get('itemType').value,
            slot: this.addItemForm.get('itemSlotType').value || 0,
            container: {
                associatedKeyId: this.addItemForm.get('selectContainerKey').value,
                canLock: this.addItemForm.get('containerCanLock').value || false,
                canOpen: this.addItemForm.get('containerCanOpen').value || false,
                LockDifficulty: +this.addItemForm.get('lockStrength').value,
                items: this.containerItems,
                size: +this.addItemForm.get('containerSize').value,
                isLocked: this.addItemForm.get('containerLocked').value || false,
                isOpen: this.addItemForm.get('containerOpen').value || false,
            },
            book: {
                pageCount: this.addItemForm.get('pageCount').value || 0,
                pages: pages,
                blank: this.addItemForm.get('pages').value.length > 1
            },
            description: {
                Room: this.addItemForm.get('roomDescription').value,
                Exam: this.addItemForm.get('examDescription').value,
                Look: this.addItemForm.get('lookDescription').value,
                Smell: this.addItemForm.get('smellDescription').value,
                Taste: this.addItemForm.get('tasteDescription').value,
                Touch: this.addItemForm.get('touchDescription').value
            },
            armourRating: {
                armour: this.addItemForm.get('acPierce').value,
                magic: this.addItemForm.get('acMagic').value
            },
            attackType: this.addItemForm.get('attackType').value || 0,
            damage: {
                DiceRoll: this.addItemForm.get('minDamage').value || 1,
                DieSize: this.addItemForm.get('maxDamage').value || 1
            },
            weaponType: this.addItemForm.get('weaponType').value || 0,
            condition: 1,
            containerItems: [],
            damageType: this.addItemForm.get('damageType').value || 0,
            decayTimer: 2,
            forageRank: 0,
            hidden: false,
            infinite: false,
            isHiddenInRoom: false,
            itemFlags: this.addItemForm.get('flags').value,
            keywords: [],
            minLevel: this.addItemForm.get('minLevel').value,
            modifiers: {},
            questItem: false,
            stuck: false,
            uses: 0,
            weight: 5
        };

        this.store.dispatch(new PostItem(item));
    }
}

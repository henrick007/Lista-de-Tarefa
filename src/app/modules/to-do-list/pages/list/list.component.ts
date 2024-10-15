import { Component, signal } from '@angular/core';
import { InputAddItemComponent } from '../../components/input-add-item/input-add-item.component';
import { IListitems } from '../../interface/IListitems.interface';
import { InputListItemComponent } from '../../components/input-list-item/input-list-item.component';
import { ELocalStorage } from '../../enum/ELocalStorage.enum';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [InputAddItemComponent, InputListItemComponent],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class ListComponent {
  public addItem = signal(true);

  #setListItem = signal<IListitems[]>(this.#parseItem());
  public getListItems = this.#setListItem.asReadonly();

  #parseItem() {
    return JSON.parse(localStorage.getItem(ELocalStorage.MY_LIST) || '[]');
  }

  #updateLocalStorage() {
    return localStorage.setItem(
      ELocalStorage.MY_LIST,
      JSON.stringify(this.#setListItem())
    );
  }

  public getInputAndAddItem(value: IListitems) {
    localStorage.setItem(
      ELocalStorage.MY_LIST, 
      JSON.stringify([...this.#setListItem(), value]));
    return this.#setListItem.set(this.#parseItem());
  }

  public listItemStage(value: 'pending' | 'completed') {
    return this.getListItems().filter((res:IListitems) =>{
      if (value === 'pending') {
        return !res.checked;
      }

      if(value === 'completed') {
        return res.checked;
      }

      return res;
    });
  }

  public updateItemCheckbox(newItem: {id: string; checked: boolean}) {
    this.#setListItem.update((oldValue: IListitems[]) => {
      oldValue.filter( res => {
        if(res.id === newItem.id){
          res.checked = newItem.checked;
          return res;
        }
        return res;
      });
      return oldValue;
    });
    return this.#updateLocalStorage()
  }

  public updateItemText(newItem: {id: string; value: string }) {
    this.#setListItem.update((oldValue: IListitems[]) => {
      oldValue.filter((res) =>{
        if (res.id === newItem.id) {
          res.value = newItem.value;
          return res;
        }
        return res;
      });
      return oldValue;
    });
    return this.#updateLocalStorage()
  }

  public deleteItem(id: string) {
    Swal.fire({
      title: "Tem certeza?",
      text: "Você não poderá reverter isso!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sim, deletar o item",
    }).then((result) => {
      if (result.isConfirmed) {
        this.#setListItem.update((oldValue: IListitems[]) => {
          return oldValue.filter((res) => res.id !== id);
        });
        return this.#updateLocalStorage();
      }
    });
  }

  public deleteAllItems() {
    Swal.fire({
      title: "Tem certeza?",
      text: "Você não poderá reverter isso!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sim, deletar tudo",
    }).then((result) => {
      if (result.isConfirmed) {
      localStorage.removeItem(ELocalStorage.MY_LIST);
      return this.#setListItem.set(this.#parseItem());
      }
    });
  }
}

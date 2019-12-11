import {Component, Inject} from '@angular/core';

import {Bingo} from '../assets/Bingo';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MatSnackBar} from '@angular/material/snack-bar';

import {isStorageAvailable, LOCAL_STORAGE, StorageService} from 'ngx-webstorage-service';

import {SubmitService} from './submit/submit.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component-0801.css'],
  providers: [SubmitService]
})
export class AppComponent {
  /* constants */
  readonly title = 'Buzzword Bingo!';
  readonly bingo = new Bingo();
  readonly dateOfStart = new Date('2019-12-11');
  readonly emailPattern = '^[^@]*@(ext.)?csas.cz';

  /* form */
  bingoForm: FormGroup;
  emailFormControl: FormControl;
  fuckUpFormControl: FormControl;

  /* control flags */
  storageAvailable: boolean;
  enabledBingoFlag = this.isBingoEnabled();
  isBingo = false;
  showFinalSuccessFlag = false;

  constructor(private formBuilder: FormBuilder,
              private snackBar: MatSnackBar,
              @Inject(LOCAL_STORAGE) private storage: StorageService,
              private submitService: SubmitService) {
    this.storageAvailable = isStorageAvailable(sessionStorage);

    this.emailFormControl = new FormControl(this.storageAvailable ? this.storage.get('email') : '',
      [Validators.required, Validators.pattern(this.emailPattern)]);
    this.fuckUpFormControl = new FormControl(this.storageAvailable ? this.storage.get('fuckup') : '',
      [Validators.required]);
    this.bingoForm = formBuilder.group([this.emailFormControl, this.fuckUpFormControl]);
  }

  isBingoEnabled(): boolean {
    return Date.now() > this.dateOfStart.getTime();
  }

  enableBingo() {
    this.enabledBingoFlag = true;
  }

  handleBingo(isBingo: boolean) {
    /*
    if (!this.isBingo && isBingo) {
      this.snackBar.open('👏 Bingo 👏', 'x');
    }
    */
    this.isBingo = isBingo;
  }

  private storeInLocalStorage(key: string, value: string) {
    if (this.storageAvailable) {
      this.storage.set(key, value);
    }
  }

  emailChanged(email: string) {
    this.storeInLocalStorage('email', email);
  }

  fuckupChanged(fuckup: string) {
    this.storeInLocalStorage('fuckup', fuckup);
  }

  submit() {
    this.submitService.doSubmit(
      this.emailFormControl.value,
      this.fuckUpFormControl.value,
      this.bingo.tiles)
      .subscribe(
        (val) => {
          console.log('POST successfull', val);
          this.enabledBingoFlag = false;
          this.showFinalSuccessFlag = true;
        },
        error => {
          console.log('POST call in error', error);
          this.handleSubmitError(error);
        },
        () => {
          console.log('POST subscription observable ended');
        })
    ;
  }

  handleSubmitError(error) {
    alert('Nepodařilo se odeslat na server, ověřte připojení a zkuste to znova.\n\n' + JSON.stringify(error));
  }
}

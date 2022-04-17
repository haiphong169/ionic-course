import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Place } from 'src/app/places/place.model';

@Component({
  selector: 'app-create-booking',
  templateUrl: './create-booking.component.html',
  styleUrls: ['./create-booking.component.scss'],
})
export class CreateBookingComponent implements OnInit {
  @Input() selectedPlace: Place;
  @ViewChild('f', { static: true }) form: NgForm;

  constructor(private modalController: ModalController) {}

  ngOnInit() {}

  onCancel() {
    this.modalController.dismiss(null, 'cancel');
  }

  onBookPlace() {
    this.modalController.dismiss(
      {
        bookingData: {
          firstName: this.form.value['first-name'],
          lastName: this.form.value['last-name'],
          guestsNumber: +this.form.value['guest-number'],
          dateFrom: new Date(this.form.value['date-from']),
          dateTo: new Date(this.form.value['date-to']),
        },
      },
      'confirm'
    );
  }

  datesAreValid() {
    const startDate = new Date(this.form.value['date-form']);
    const endDate = new Date(this.form.value['date-to']);

    return endDate > startDate;
  }
}

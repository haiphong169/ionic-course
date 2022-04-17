/* eslint-disable max-len */
/* eslint-disable no-underscore-dangle */
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { Place } from './place.model';
import { take, map, tap, delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  private _places = new BehaviorSubject<Place[]>([
    new Place(
      'p1',
      'Manhattan Mansion',
      'In the heart of NYC',
      'https://imgs.6sqft.com/wp-content/uploads/2014/06/21042533/Carnegie-Mansion-nyc.jpg',
      149.99,
      new Date('2019-01-01'),
      new Date('2019-12-31'),
      'abc'
    ),
    new Place(
      'p2',
      'Chouchou',
      'A romantic place in Paris',
      'https://media.cntraveller.com/photos/61a65154b2a87fcf2e68748a/16:9/w_2580,c_limit/CHOUCHOU%20HD%20nov21-%C2%A9%20Nicolas%20Anetson-98.jpeg',
      129.99,
      new Date('2019-01-01'),
      new Date('2019-12-31'),
      'abc'
    ),
    new Place(
      'p3',
      'Burj Al Arab',
      'Best hotel on the world',
      'https://cdn.jumeirah.com/-/mediadh/dh/hospitality/jumeirah/article/stories/dubai/15-amazing-facts-about-the-burj-al-arab/burj-al-arab-jumeirah-jumeirah-beach-hotel-jumeirah-al-naseem-private-beach-drone_6-4.jpg',
      349.99,
      new Date('2019-01-01'),
      new Date('2019-12-31'),
      'abc'
    ),
  ]);

  get places() {
    return this._places.asObservable();
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  constructor(private authService: AuthService) {}

  getPlace(id: string) {
    return this.places.pipe(
      take(1),
      map((places) => ({ ...places.find((p) => p.id === id) }))
    );
  }

  addPlace(
    title: string,
    description: string,
    price: number,
    dateFrom: Date,
    dateTo: Date
  ) {
    const newPlace = new Place(
      Math.random().toString(),
      title,
      description,
      'https://cdn.jumeirah.com/-/mediadh/dh/hospitality/jumeirah/article/stories/dubai/15-amazing-facts-about-the-burj-al-arab/burj-al-arab-jumeirah-jumeirah-beach-hotel-jumeirah-al-naseem-private-beach-drone_6-4.jpg',
      price,
      dateFrom,
      dateTo,
      this.authService.userId
    );
    return this.places.pipe(
      take(1),
      delay(1000),
      tap((places) => {
        setTimeout(() => {
          this._places.next(places.concat(newPlace));
        }, 1000);
      })
    );
  }

  updateOffer(placeId: string, title: string, description: string) {
    return this.places.pipe(
      take(1),
      delay(1000),
      tap((places) => {
        const updatedPlaceIndex = places.findIndex((pl) => pl.id === placeId);
        const updatedPlaces = [...places];
        const oldPlace = updatedPlaces[updatedPlaceIndex];
        updatedPlaces[updatedPlaceIndex] = new Place(
          oldPlace.id,
          title,
          description,
          oldPlace.imageUrl,
          oldPlace.price,
          oldPlace.availableFrom,
          oldPlace.availableTo,
          oldPlace.userId
        );
        this._places.next(updatedPlaces);
      })
    );
  }
}

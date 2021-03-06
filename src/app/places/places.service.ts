/* eslint-disable max-len */
/* eslint-disable no-underscore-dangle */
import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { Place } from './place.model';
import { take, map, tap, delay, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

// new Place(
//   'p1',
//   'Manhattan Mansion',
//   'In the heart of NYC',
//   'https://imgs.6sqft.com/wp-content/uploads/2014/06/21042533/Carnegie-Mansion-nyc.jpg',
//   149.99,
//   new Date('2019-01-01'),
//   new Date('2019-12-31'),
//   'abc'
// ),
// new Place(
//   'p2',
//   'Chouchou',
//   'A romantic place in Paris',
//   'https://media.cntraveller.com/photos/61a65154b2a87fcf2e68748a/16:9/w_2580,c_limit/CHOUCHOU%20HD%20nov21-%C2%A9%20Nicolas%20Anetson-98.jpeg',
//   129.99,
//   new Date('2019-01-01'),
//   new Date('2019-12-31'),
//   'abc'
// ),
// new Place(
//   'p3',
//   'Burj Al Arab',
//   'Best hotel on the world',
//   'https://cdn.jumeirah.com/-/mediadh/dh/hospitality/jumeirah/article/stories/dubai/15-amazing-facts-about-the-burj-al-arab/burj-al-arab-jumeirah-jumeirah-beach-hotel-jumeirah-al-naseem-private-beach-drone_6-4.jpg',
//   349.99,
//   new Date('2019-01-01'),
//   new Date('2019-12-31'),
//   'abc'
// ),

interface PlaceData {
  availableFrom: string;
  availableTo: string;
  description: string;
  imageUrl: string;
  price: number;
  title: string;
  userId: string;
}

@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  private _places = new BehaviorSubject<Place[]>([]);

  get places() {
    return this._places.asObservable();
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  constructor(private authService: AuthService, private http: HttpClient) {}

  getPlace(id: string) {
    return this.http
      .get<PlaceData>(
        `https://ionic-angular-800a4-default-rtdb.asia-southeast1.firebasedatabase.app/offered-places/${id}.json`
      )
      .pipe(
        map(
          (placeData) =>
            new Place(
              id,
              placeData.title,
              placeData.description,
              placeData.imageUrl,
              placeData.price,
              new Date(placeData.availableFrom),
              new Date(placeData.availableTo),
              placeData.userId
            )
        )
      );
  }

  fetchPlaces() {
    return this.http
      .get<{ [key: string]: PlaceData }>(
        'https://ionic-angular-800a4-default-rtdb.asia-southeast1.firebasedatabase.app/offered-places.json'
      )
      .pipe(
        map((resData) => {
          const places = [];
          for (const key in resData) {
            if (resData.hasOwnProperty(key)) {
              places.push(
                new Place(
                  key,
                  resData[key].title,
                  resData[key].description,
                  resData[key].imageUrl,
                  resData[key].price,
                  new Date(resData[key].availableFrom),
                  new Date(resData[key].availableTo),
                  resData[key].userId
                )
              );
            }
          }
          return places;
        }),
        tap((places) => {
          this._places.next(places);
        })
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
    let generatedId: string;
    return this.http
      .post<{ name: string }>(
        'https://ionic-angular-800a4-default-rtdb.asia-southeast1.firebasedatabase.app/offered-places.json',
        { ...newPlace, id: null }
      )
      .pipe(
        switchMap((resData) => {
          generatedId = resData.name;
          return this.places;
        }),
        take(1),
        tap((places) => {
          newPlace.id = generatedId;
          this._places.next(places.concat(newPlace));
        })
      );
  }

  updateOffer(placeId: string, title: string, description: string) {
    let updatedPlaces: Place[];
    return this.places.pipe(
      take(1),
      switchMap((places) => {
        if (!places || places.length === 0) {
          return this.fetchPlaces();
        } else {
          return of(places);
        }
      }),
      switchMap((places) => {
        const updatedPlaceIndex = places.findIndex((pl) => pl.id === placeId);
        updatedPlaces = [...places];
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
        return this.http.put(
          `https://ionic-angular-800a4-default-rtdb.asia-southeast1.firebasedatabase.app/offered-places/${placeId}.json`,
          { ...updatedPlaces[updatedPlaceIndex], id: null }
        );
      }),
      tap(() => {
        this._places.next(updatedPlaces);
      })
    );
  }
}

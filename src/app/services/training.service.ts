import { Exercise } from './../models/exercise.model';
import { Injectable } from '@angular/core';
import { Subject, Subscription } from 'rxjs';

import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TrainingService {

  exerciseChanged = new Subject<Exercise>();
  exercisesChanged = new Subject<Exercise[]>();
  finishedExercisesChanged = new Subject<Exercise[]>();
  private availableExecises: Exercise[] = [];
  private runningExercise: Exercise;

  private fbSubs: Subscription[] = [];

  constructor(private db: AngularFirestore) { }

  fetchAvailableExercises() {
    this.fbSubs.push(this.db
    .collection('availableExecises')
    .snapshotChanges()
    .pipe(map(docArray => {
      return docArray.map(doc => {
        return {
          id: doc.payload.doc.id,
          name: doc.payload.doc.data()['name'],
          duration: doc.payload.doc.data()['duration'],
          calories: doc.payload.doc.data()['calories']
        };
      });
    })).subscribe((exercises: Exercise[]) => {
      this.availableExecises = exercises;
      this.exercisesChanged.next([...this.availableExecises]);
    }));
  }
  
  startExercise(selectedId: string) {
    this.runningExercise = this. availableExecises.find(
      ex => ex.id === selectedId
    );
    this.exerciseChanged.next({
      ...this.runningExercise
    });
  }

  getRunningExercise() {
    return {...this.runningExercise};
  }

  completeExercise() {
    this.addDataToDatabase({
      ...this.runningExercise, 
      date: new Date(), 
      state: 'completed'});
    this.runningExercise = null;
    this.exerciseChanged.next(null);
  }

  cancelExercise(progress: number) {
    this.addDataToDatabase({
      ...this.runningExercise,
      duration: this.runningExercise.duration * (progress / 100),
      calories: this.runningExercise.calories * (progress / 100), 
      date: new Date(), 
      state: 'cancelled'});
    this.runningExercise = null;
    this.exerciseChanged.next(null);
  }

  fetchCompleteOrCancelledExercises() {
    this.fbSubs.push(this.db.collection('finishedExercises')
      .valueChanges()
      .subscribe((exercises: Exercise[]) => {
        this.finishedExercisesChanged.next(exercises);
      }));
  }

  cancelSubscriptions() {
    this.fbSubs.forEach(sub => sub.unsubscribe());
  }

  private addDataToDatabase(exercise: Exercise){
    this.db.collection('finishedExercises').add(exercise);
  }
}

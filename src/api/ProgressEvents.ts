import { BehaviorSubject, asyncScheduler, Observable, ObservableInput } from "rxjs";
import { tap, catchError, observeOn } from "rxjs/operators";

class ProgressEvents {
    public subscriber: Subscriber;
    private eventsProcessor: BehaviorSubject<Events>;
    public connectionEventsFlowable: Observable<Events>;
    private eventMap: Record<string, Events>;

    constructor() {
        this.subscriber = new Subscriber();
        this.eventsProcessor = new BehaviorSubject<Events>(new Events());
        this.connectionEventsFlowable = this.eventsProcessor.asObservable();
        this.eventMap = {
            "Init": new Events(),
            "ConnectionStarted": new Events(),
            "ConnectionSetupComplete": new Events(),
            "Disconnect": new Events(),
            "AlarmDataLoaded": new Events(),
            "NotificationsEnabled": new Events(),
            "NotificationsDisabled": new Events(),
            "WatchInitializationCompleted": new Events(),
            "AllPermissionsAccepted": new Events(),
            "ButtonPressedInfoReceived": new Events(),
            "ConnectionFailed": new Events(),
            "SettingsLoaded": new Events(),
            "NeedToUpdateUI": new Events(),
            "CalendarUpdated": new Events(),
            "HomeTimeUpdated": new Events(),
            "ApiError": new Events(),
        };
    }

    onNext(eventName: string, payload: any = null): void {
        if (!this.eventMap[eventName]) {
            this.addEvent(eventName);
        }

        const event = this.eventMap[eventName];
        if (event) {
            event.payload = payload;
            this.eventsProcessor.next(event);
        }
    }

    get(eventName: string): Events | undefined {
        return this.eventMap[eventName];
    }

    private addEvent(eventName: string): void {
        if (!this.eventMap[eventName]) {
            this.eventMap[eventName] = new Events();
        }
    }

    getPayload(eventName: string): any {
        return this.eventMap[eventName] ? this.eventMap[eventName].payload : null;
    }

    addPayload(eventName: string, payload: any): void {
        if (this.eventMap[eventName]) {
            this.eventMap[eventName].payload = payload;
        }
    }
}

class Subscriber {
    private subscribers: Set<string>;

    constructor() {
        this.subscribers = new Set<string>();
    }

    start(name: string, onNextStr: (event: Events) => void, onError: (error: any) => ObservableInput<any>): void {
        if (this.subscribers.has(name)) {
            return;
        }

        console.log(`Subscribing to ${name}`);
        this.subscribers.add(name);

        progressEvents.connectionEventsFlowable.pipe(
            observeOn(asyncScheduler),
            tap(onNextStr),
            catchError(onError)
        ).subscribe((v) => console.info(v), onError);
    }

    stop(name: string): void {
        this.subscribers.delete(name);
    }
}

class Events {
    public payload: any;

    constructor(payload: any = null) {
        this.payload = payload;
    }
}

export const progressEvents = new ProgressEvents();

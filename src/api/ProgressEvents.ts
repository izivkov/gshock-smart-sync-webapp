import { EventAvailable } from "@mui/icons-material";
import { BehaviorSubject, asyncScheduler, Observable, ObservableInput, Subscription } from "rxjs";
import { tap, catchError, observeOn, filter } from "rxjs/operators";
import objectHash from 'object-hash';

interface IEventAction {
    label: string;
    action: () => void;
}

export class EventAction implements IEventAction {
    constructor(public label: string, public action: () => void) { }
}

type ReverseEventMap = Record<string, string>;

class ProgressEvents {
    public subscriber: Subscriber;
    private eventsProcessor: BehaviorSubject<Events>;
    public connectionEventsFlowable: Observable<Events>;
    private eventMap: Record<string, Events>;
    reverseEventMap: Record<string, string>;

    constructor() {
        this.subscriber = new Subscriber();
        const firstEvent = new Events();
        this.eventsProcessor = new BehaviorSubject<Events>(firstEvent);
        this.connectionEventsFlowable = this.eventsProcessor.asObservable();
        this.eventMap = {
            "FirstEventPlaceholder": firstEvent,
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

        function switchKeysAndValues(inputMap: Record<string, Events>): Record<string, string> {
            const switchedMap: Record<string, string> = {};

            for (const key in inputMap) {
                if (inputMap.hasOwnProperty(key)) {
                    const event = inputMap[key];
                    switchedMap[event.getUniqueId()] = key;
                }
            }

            return switchedMap;
        }

        this.reverseEventMap = switchKeysAndValues(this.eventMap);
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
            const event = new Events();
            this.eventMap[eventName] = event;
            this.reverseEventMap[event.getUniqueId()] = eventName;
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

    runEventActions(name: string, eventActions: EventAction[]): void {
        this.subscriber.runEventActions(name, eventActions);
    }
    stop(name: string): void {
        this.subscriber.stop(name);
    }
}

class Subscriber {
    private subscriptions: Map<string, Subscription>;

    constructor() {
        this.subscriptions = new Map<string, Subscription>();
    }

    /**
    * @deprecated This function is deprecated. Use runEventActions() instead.
    */
    start(name: string, onNextStr: (event: Events) => void, onError: (error: any) => ObservableInput<any>): void {
        if (this.subscriptions.has(name)) {
            return;
        }

        console.log(`Subscribing to ${name}`);

        const subscription = progressEvents.connectionEventsFlowable.pipe(
            filter((event) => 1 === 1),
            observeOn(asyncScheduler),
            tap(onNextStr),
            catchError(onError)
        ).subscribe({
            next: (v) => console.log(v),
            error: (e) => console.error(e),
            complete: () => console.info('complete')
        });

        this.subscriptions.set(name, subscription);
    }

    runEventActions(name: string, eventActions: EventAction[]): void {
        if (this.subscriptions.has(name)) {
            return;
        }
        
        const parentSubscription = new Subscription();

        const runActions = () => {
            eventActions.forEach((eventAction) => {
                const filterFunction = (event: Events): boolean => {
                    const id = event.getUniqueId();
                    const nameOfEvent = progressEvents.reverseEventMap[id];
                    return nameOfEvent !== null && nameOfEvent === eventAction.label;
                };

                const onNext = (event: Events): void => {
                    eventAction.action();
                };

                const subscription = progressEvents.connectionEventsFlowable.pipe(
                    filter(event => filterFunction(event)),
                    observeOn(asyncScheduler),
                    tap(onNext),
                    catchError(() => {
                        return new Observable();
                    }))
                    .subscribe({
                        next: (v) => console.log(v),
                        error: (e) => console.error(e),
                        complete: () => console.info('complete')
                    });
                
                parentSubscription.add(subscription);
            });
        };

        runActions();
        this.subscriptions.set(name, parentSubscription);
    }

    stop(name: string): void {
        const subscription = this.subscriptions.get(name);
        if (subscription) {
            subscription.unsubscribe();
            this.subscriptions.delete(name);
        }
    }
}

class Events {
    public payload: any;

    private static nextId = 0;
    private id: number;

    constructor(payload: any = null) {
        this.payload = payload;
        this.id = Events.nextId;
        Events.nextId++;
    }

    getUniqueId(): number {
        return this.id;
    }
}

export const progressEvents = new ProgressEvents();

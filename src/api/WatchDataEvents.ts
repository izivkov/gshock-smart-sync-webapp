import { Subject } from 'rxjs';

const WatchDataEvents = {
    subjects: new Map<string, Subject<any>>(),
    subscribers: new Map<string, Set<string>>(),

    addSubject(name: string): void {
        if (!this.subjects.has(name)) {
            this.subjects.set(name, new Subject());
        }
    },

    addSubscriberAndSubject(subscriber: string, subject: string): void {
        if (!this.subscribers.has(subscriber)) {
            this.subscribers.set(subscriber, new Set());
        }

        const subjectsForThisSubscriber = this.subscribers.get(subscriber);
        if (subjectsForThisSubscriber) {
            subjectsForThisSubscriber.add(subject);
        }
    },

    subscriberAlreadySubscribed(subscriber: string, subject: string): boolean {
        if (!this.subscribers.has(subscriber)) {
            return false;
        }

        const subjectsForThisSubscriber = this.subscribers.get(subscriber);
        return subjectsForThisSubscriber?.has(subject) || false;
    },

    subscribe(subscriberName: string, subject: string, onNext: (event: any) => void): void {
        if (!this.subscriberAlreadySubscribed(subscriberName, subject)) {
            this.getProcessor(subject)?.subscribe(onNext);
            this.addSubscriberAndSubject(subscriberName, subject);
        }
    },

    subscribeWithDeferred(subscriberName: string, subject: string, onNext: (event: any) => void): void {
        if (!this.subscriberAlreadySubscribed(subscriberName, subject)) {
            this.getProcessor(subject)?.subscribe(onNext);
            this.addSubscriberAndSubject(subscriberName, subject);
        }
    },

    getProcessor(name: string): Subject<any> | undefined {
        return this.subjects.get(name);
    },

    emitEvent(name: string, event: any): void {
        const subject = this.subjects.get(name);
        if (subject) {
            subject.next(event);
        }
    },
};

// Example usage:
// WatchDataEvents.addSubject('your_subject_name');
// WatchDataEvents.subscribe('subscriber1', 'your_subject_name', (event) => console.log(event));
// WatchDataEvents.emitEvent('your_subject_name', { data: 'example_data' });

export default WatchDataEvents;

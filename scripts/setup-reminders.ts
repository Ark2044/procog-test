import createRemindersCollection from '../models/server/reminder.collection';

async function setup() {
    try {
        console.log('Setting up reminders collection...');
        await createRemindersCollection();
        console.log('Reminders collection setup complete!');
    } catch (error) {
        console.error('Error setting up reminders:', error);
        process.exit(1);
    }
}

setup();
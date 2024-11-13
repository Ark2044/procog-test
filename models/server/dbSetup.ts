import { db } from "../name";
import createSolutionCollection from "./solution.collection";
import createCommentCollection from "./comment.collection";
import createRiskCollection from "./risk.collection";
import createVoteCollection from "./vote.collection";

import { databases } from "./config";

export default async function getOrCreateDB() {
    try {
        await databases.get(db)
        console.log("Database connection")
    } catch {
        try {
            await databases.create(db, db)
            console.log("database created")
            //create collections
            await Promise.all([
                createRiskCollection(),
                createSolutionCollection(),
                createCommentCollection(),
                createVoteCollection(),

            ])
            console.log("Collection created")
            console.log("Database connected")
        } catch (error) {
            console.log("Error creating databases or collection", error)
        }
    }

    return databases
}
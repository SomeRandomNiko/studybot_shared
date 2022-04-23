import mongoose, { ObjectId } from "mongoose";
import config from "./config";

export namespace DB {
    export type User = {
        discordId: string,
        discordAccessToken: string,
        discordRefreshToken: string,
        discordTokenExpires: Date,
        digregConnected: boolean,
        digregId?: number,
        digregAccessToken?: string,
        digregRefreshToken?: string,
        digregTokenExpires?: Date,
        todoList: TodoItem[],
        studyTimer: StudyTimer,
    }

    export type TodoItem = {
        title: string,
        description?: string,
        done: boolean,
        dueDate?: Date,
    }

    export type StudyTimer = {
        studyTime: number,
        breakTime: number,
    }
}


const StudyTimerSchema = new mongoose.Schema<DB.StudyTimer>({
    studyTime: { type: Number, default: 0 },
    breakTime: { type: Number, default: 0 },
})

const TodoListSchema = new mongoose.Schema<DB.TodoItem>({
    title: { type: String, required: true },
    description: { type: String, required: false },
    done: { type: Boolean, required: true, default: false },
    dueDate: { type: Date, required: false }
})

const UserSchema = new mongoose.Schema<DB.User>({
    discordId: { type: String, required: true, unique: true },
    discordAccessToken: { type: String, required: true },
    discordRefreshToken: { type: String, required: true },
    discordTokenExpires: { type: Date, required: true },
    digregConnected: { type: Boolean, required: true },
    digregId: { type: Number, required: false },
    digregAccessToken: { type: String, required: false },
    digregRefreshToken: { type: String, required: false },
    digregTokenExpires: { type: Date, required: false },
    todoList: [TodoListSchema],
    studyTimer: { type: StudyTimerSchema, default: { breakTime: 0, studyTime: 0 } },
})

const UserModel = mongoose.model<DB.User>("user", UserSchema);

export function connect() {
    return mongoose.connect(config.mongodbURI);
}

export function getUser(discordId: string) {
    return UserModel.findOne({ discordId: discordId });
}

export function createUser(discordId: string, discordAccessToken: string, discordRefreshToken: string, discordTokenExpires: Date) {
    return UserModel.create({
        discordId: discordId,
        digregConnected: false,
        discordAccessToken: discordAccessToken,
        discordRefreshToken: discordRefreshToken,
        discordTokenExpires: discordTokenExpires,
        todoList: [],
        studyTimer: { breakTime: 5, studyTime: 25 },
    });
}

export function setDiscordTokens(discordId: string, discordAccessToken: string, discordRefreshToken: string, discordTokenExpires: Date) {
    return UserModel.updateOne({ discordId: discordId }, {
        discordAccessToken: discordAccessToken,
        discordRefreshToken: discordRefreshToken,
        discordTokenExpires: discordTokenExpires
    });
}

export function setDigregTokens(discordId: string, digregAccessToken: string, digregTokenExpires: Date, digregId?: number, digregRefreshToken?: string) {
    const data = {
        digregConnected: true,
        digregId: digregId,
        digregAccessToken: digregAccessToken,
        digregRefreshToken: digregRefreshToken,
        digregTokenExpires: digregTokenExpires
    }

    if (!digregRefreshToken)
        delete data.digregRefreshToken;

    if (!digregId)
        delete data.digregId;

    return UserModel.updateOne({ discordId: discordId }, data);
}

export function disconnectDigreg(discordId: string) {
    return UserModel.updateOne({ discordId: discordId }, {
        digregConnected: false,
        digregId: null,
        digregAccessToken: null,
        digregRefreshToken: null,
        digregTokenExpires: null
    });
}

export function addTodoItem(discordId: string, todoItem: DB.TodoItem) {
    return UserModel.updateOne({ discordId: discordId }, {
        $push: { todoList: todoItem }
    });
}

export function removeTodoItem(discordId: string, todoItemId: ObjectId) {
    return UserModel.updateOne({ discordId: discordId }, {
        $pull: { todoList: { _id: todoItemId } }
    });
}

export function updateTodoItem(discordId: string, todoItemId: ObjectId, todoItem: DB.TodoItem) {
    return UserModel.updateOne({ discordId: discordId, "todoList._id": todoItemId }, {
        $set: { "todoList.$": todoItem }
    });
}

export function setStudyTimer(discordId: string, studyTimer: DB.StudyTimer) {
    return UserModel.updateOne({ discordId: discordId }, {
        $set: { studyTimer: studyTimer }
    });
}

export function getStudyTimer(discordId: string) {
    return UserModel.findOne({ discordId: discordId }).then(user => {
        return user?.studyTimer;
    });
}

export function getTodoList(discordId: string) {
    return UserModel.findOne({ discordId: discordId }).then(user => {
        return user?.todoList;
    });
}

export function getDiscordTokens(discordId: string) {
    return UserModel.findOne({ discordId: discordId }).then(user => {
        return {
            discordAccessToken: user?.discordAccessToken,
            discordRefreshToken: user?.discordRefreshToken,
            discordTokenExpires: user?.discordTokenExpires
        };
    });
}

export function getDigregTokens(discordId: string) {
    return UserModel.findOne({ discordId: discordId }).then(user => {
        return {
            digregAccessToken: user?.digregAccessToken,
            digregRefreshToken: user?.digregRefreshToken,
            digregTokenExpires: user?.digregTokenExpires
        };
    });
}
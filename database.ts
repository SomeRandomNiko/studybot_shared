
import axios from "axios";
import mongoose from "mongoose";
import config from "./config";
import { APIDMChannel, APIMessage } from "discord-api-types/v10";

export namespace DB {
    export type User = {
        _id?: string,
        discordId: string,
        digregConnected: boolean,
        digregId?: number,
        digregAccessToken?: string,
        digregRefreshToken?: string,
        digregTokenExpires?: Date,
        todoList: TodoItem[],
        studyTimer: StudyTimer,
    }

    export type TodoItem = {
        _id?: string,
        title: string,
        description?: string,
        done: boolean,
        dueDate?: Date,
    }

    export type StudyTimer = {
        _id?: string,
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

export function createUser(discordId: string) {
    const dbUser = UserModel.create({
        discordId: discordId,
        digregConnected: false,
        todoList: [],
        studyTimer: { breakTime: 5, studyTime: 25 },
    });

    axios.post<APIDMChannel>(
        "https://discord.com/api/users/@me/channels",
        { recipient_id: discordId },
        { headers: { Authorization: "Bot " + config.discordBotToken } }
    ).then(({ data: dmChannel }) => {
        axios.post<APIMessage>(
            `https://discord.com/api/channels/${dmChannel.id}/messages`,
            {
                embeds: [{
                    title: "Welcome to studybot",
                    description: "With studybot you can manage your productivity on Discord!\nFor more information visit [studybot.it](https://studybot.it).\nIf you connect your Digital Register you can even see your marks and much more.",
                    color: 0x3ba55d
                }],
                components: [
                    {
                        type: 1,
                        components: [
                            {
                                style: 5,
                                label: `Join the Server`,
                                url: `https://discord.gg/63xeAnNpq3`,
                                disabled: false,
                                emoji: {
                                    id: null,
                                    name: `🧠`
                                },
                                type: 2
                            }
                        ]
                    }
                ]
            },
            { headers: { Authorization: "Bot " + config.discordBotToken } }
        );
    });

    return dbUser;
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

export function removeTodoItem(discordId: string, todoItemId: string) {
    return UserModel.updateOne({ discordId: discordId }, {
        $pull: { todoList: { _id: todoItemId } }
    });
}

export function updateTodoItem(discordId: string, todoItemId: string, todoItem: DB.TodoItem) {
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

export function getDigregTokens(discordId: string) {
    return UserModel.findOne({ discordId: discordId }).then(user => {
        return {
            digregAccessToken: user?.digregAccessToken,
            digregRefreshToken: user?.digregRefreshToken,
            digregTokenExpires: user?.digregTokenExpires
        };
    });
}

export function deleteAllTodoItems(discordId: string) {
    return UserModel.updateOne({ discordId: discordId }, {
        $set: { todoList: [] }
    });
}

export function getTodoItem(discordId: string, todoItemId: string) {
    return UserModel.findOne({ discordId: discordId }).select("todoList").then(todo => {
        if (!todo)
            return null;

        const todoItem = todo.todoList.find(item => item._id?.toString() === todoItemId);
        if (!todoItem)
            return null;

        return todoItem;
    });
}
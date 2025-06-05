export class Helpers {
    static generateUUIDv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = (Math.random() * 16) | 0,
                v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }

    static strPad(value) {
        return String(value).padStart(2, '0');
    }

    static formatDate(timestamp) {
        const date = new Date(timestamp);

        const year = date.getFullYear();
        const month = Helpers.strPad(date.getMonth() + 1);
        const day = Helpers.strPad(date.getDate());

        return `${day}/${month}/${year}`;
    }

    static formatTime(timestamp) {
        const date = new Date(timestamp);

        const hours = Helpers.strPad(date.getHours());
        const minutes = Helpers.strPad(date.getMinutes());
        const seconds = Helpers.strPad(date.getSeconds());

        return `${hours}:${minutes}:${seconds}`;
    }
}
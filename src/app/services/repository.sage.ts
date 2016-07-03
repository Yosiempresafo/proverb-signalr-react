import { common } from "../common/common";
import { config } from "../app";
import { loggerFunction } from "../common/logger";
import { saying } from "./repository.saying";

export interface sage {
    id: number;
    name: string;
    username: string;
    email: string;
    dateOfBirth: Date;
    sayings?: saying[];
}

export const repositorySageServiceName = "repository.sage";

export class RepositorySageService {

    log: loggerFunction;
    rootUrl: string;
    cache: Map<number, sage>;

    static $inject = ["$http", "common", "config"];
    constructor(private $http: ng.IHttpService, private common: common, private config: config) {
        this.log = common.logger.getLogFn(repositorySageServiceName);
        this.rootUrl = config.remoteServiceRoot + "sage";
        this.cache = new Map();
    }

    getAll() {
        return this.$http.get<sage[]>(this.rootUrl).then(response => {
            var sages = response.data;
            this.log(sages.length + " Sages loaded");
            return sages;
        });
    }

    getById(id: number, forceRemote?: boolean) {
        var sage: sage;
        if (!forceRemote) {
            sage = this.cache.get(id);
            if (sage) {
                this.log("Sage " + sage.name + " [id: " + sage.id + "] loaded from cache");
                return this.common.$q.when(sage);
            }
        }

        return this.$http.get<sage>(this.rootUrl + "/" + id).then(response => {
            sage = response.data;
            this.cache.set(sage.id, sage);
            this.log("Sage " + sage.name + " [id: " + sage.id + "] loaded");
            return sage;
        });
    }

    remove(id: number) {
        return this.$http.delete<void>(this.rootUrl + "/" + id).then(response => {
            this.log("Sage [id: " + id + "] removed");

            return response.data;
        }, errorReason => this.common.$q.reject(errorReason.data));
    }

    save(sage: sage) {
        return this.$http.post<void>(this.rootUrl, sage).then(response => {
            this.log("Sage " + sage.name + " [id: " + sage.id + "] saved");

            return response.data;
        }, errorReason => this.common.$q.reject(errorReason.data));
    }
}
enum ParentLogType {
    APP = 'app',
    SQL = 'sql',
    API = 'api',
}

export class LogType {
    private readonly _parentLogType: ParentLogType
    private readonly _name: string

    static readonly APP_ERROR = new LogType(ParentLogType.APP, 'error')
    static readonly APP_INFO = new LogType(ParentLogType.APP, 'info')

    static readonly SQL_QUERY = new LogType(ParentLogType.SQL, 'query')
    static readonly SQL_RESPONSE = new LogType(ParentLogType.SQL, 'response')
    static readonly SQL_ERROR = new LogType(ParentLogType.SQL, 'error')

    static readonly API_IN_REQUEST = new LogType(ParentLogType.API, 'in_request')
    static readonly API_OUT_RESPONSE = new LogType(ParentLogType.API, 'out_response')

    constructor(parentLogType: ParentLogType, name: string) {
        this._parentLogType = parentLogType
        this._name = name
    }

    get name() {
        return `${this._parentLogType}_${this._name}`
    }

    get parentLogType() {
        return this._parentLogType
    }
}

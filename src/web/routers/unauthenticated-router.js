/**
 * @Author Sebastian Kubalski
 * @Email sebastian.kubalski@gmail.com
 * @Date Creation 05/06/2017
 * @Description
 */

'use strict';
const {BaseRouter} = require('./base-router');
const {InvalidCredentialsError, ServerError, BadRequestError} = require('../utilities/error-factory');
const {AuthenticationToken} = require('../utilities/authentication-token');

const VALIDATE_USER = 'SELECT * FROM a17.validate_user($[username], $[password], $[apiKey]);';
const CREATE_USER = 'SELECT a17.create_new_user($[username], $[password]) AS api_key;';

class UnauthenticatedRouter extends BaseRouter {
    constructor() {
        super();
        this._register = this._register.bind(this);
        this._login = this._login.bind(this);
        this._setRoutes();
    }

    _setRoutes() {
        this._createPostRoute('/login', this._login);
        this._createPostRoute('/register', this._register);
    }

    getUri() {
        return '/auth';
    }

    async _login(req, res, next) {
        try {
            const user = await this._pgDb.task(async conn => {
                return await conn.oneOrNone(VALIDATE_USER, {
                    username: req.body.username,
                    password: req.body.password,
                    apiKey: req.body.api_key
                });
            });
            if (user && user.is_password_valid) {
                this._responseFactory.buildSuccessResponse(res, 200, {
                    user_id: user.id,
                    username: user.username,
                    api_key: user.api_key,
                    token: AuthenticationToken.getToken()
                });
            } else {
                this._responseFactory.propagateError(next, new InvalidCredentialsError());
            }
        } catch (err) {
            this._responseFactory.propagateError(next, new ServerError(err));
        }
    }

    async _register(req, res, next) {
        try {
            if (req.body && req.body.password && req.body.username) {
                const user = await this._pgDb.task(conn => {
                    return conn.one(CREATE_USER, {
                            username: req.body.username,
                            password: req.body.password
                        }
                    );
                });
                this._responseFactory.buildSuccessResponse(res, 201, {
                    api_key: user.api_key
                });
            } else {
                this._responseFactory.propagateError(next, new BadRequestError());
            }
        } catch (err) {
            this._responseFactory.propagateError(next, new ServerError(err));
        }
    }
}

module.exports = {UnauthenticatedRouter};
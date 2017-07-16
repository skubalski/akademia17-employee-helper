'use strict';

const {ServerError} = require("../utilities/error-factory");
const {BaseRouter} = require("./base-router");
const shortId = require("shortid");
const generatePin = require("generate-pincode");
const {InvalidEmployeeId} = require("../utilities/error-factory.js");

class AuthenticatedRouter extends BaseRouter {
    constructor() {
        super();
        this._getNewEmployeeExternalId = this._getNewEmployeeExternalId.bind(this);
        this._getNewVerificationCode = this._getNewVerificationCode.bind(this);
        this._setRoutes();
    }

    _setRoutes() {
        this._createGetRoute('/employee/:id', this._getNewEmployeeExternalId);
        this._createGetRoute('/code', this._getNewVerificationCode);
    }

    getUri() {
        return '/';
    }

    _getNewEmployeeExternalId(req, res, next) {
        try {
            const employeeId = req.params.id;
            if(employeeId) {
                this._responseFactory.buildSuccessResponse(res, 200, {
                    employee_id: `A17-${employeeId}-${shortId.generate()}`
                });
            } else {
                this._responseFactory.propagateError(next, new InvalidEmployeeId(err));
            }
        } catch(e) {
            this._responseFactory.propagateError(next, new ServerError(err));
        }
    }

    _getNewVerificationCode(req, res, next) {
        try {
            this._responseFactory.buildSuccessResponse(res, 200, {
                pin_code: generatePin(6)
            });
        } catch(e) {
            this._responseFactory.propagateError(next, new ServerError(err));
        }
    }
}

module.exports = {AuthenticatedRouter};
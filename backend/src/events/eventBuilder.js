const crypto = require('crypto');
const AppError = require('../utils/AppError');

function assertString(value, name) {
    if (typeof value !== 'string' || value.trim() === '') {
        throw new AppError(`${name} must be a non-empty string`, 400, 'VALIDATION_ERROR');
    }
}

function buildEvent({eventType, actorUserId, actorEmail, data, requestId, version = 1}) {
    assertString(eventType, 'eventType');
    assertString(actorUserId, 'actorUserId');
    const event = {
        eventId: crypto.randomUUID(),
        eventType,
        occuredAt: new Date().toISOString(),
        version,
        actor: {userId: actorUserId, email: String(actorEmail)},
        data: data || {}
    };
    if(requestId) {
        event.trace = {requestId: String(requestId)};
    }
    validateEvent(event);
    return event;
}

function validateEvent(event) {
    if (typeof event !== 'object' || event === null) {
        throw new AppError('Event must be an object', 400, 'VALIDATION_ERROR');
    }
    assertString(event.eventId, 'eventId');
    assertString(event.eventType, 'eventType');
    assertString(event.occuredAt, 'occuredAt');
    if (typeof event.version !== 'number' || event.version <= 0) {
        throw new AppError('version must be a positive number', 400, 'VALIDATION_ERROR');
    }
    if (typeof event.actor !== 'object' || event.actor === null) {
        throw new AppError('actor must be an object', 400, 'VALIDATION_ERROR');
    }
    assertString(event.actor.userId, 'actor.userId');
    if(event.data === undefined) {
        throw new AppError('data is required', 400, 'VALIDATION_ERROR');
    }
}

module.exports = {
    buildEvent,
    validateEvent
};
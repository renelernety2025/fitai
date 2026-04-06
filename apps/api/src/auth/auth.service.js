var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
let AuthService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AuthService = _classThis = class {
        constructor(usersService, jwtService) {
            this.usersService = usersService;
            this.jwtService = jwtService;
        }
        async register(dto) {
            const existing = await this.usersService.findByEmail(dto.email);
            if (existing) {
                throw new ConflictException('Email already registered');
            }
            const passwordHash = await bcrypt.hash(dto.password, 10);
            const user = await this.usersService.createUser({
                email: dto.email,
                passwordHash,
                name: dto.name,
                level: dto.level,
            });
            const accessToken = this.createToken(user.id, user.email);
            return {
                user: this.toProfile(user),
                accessToken,
            };
        }
        async login(dto) {
            const user = await this.usersService.findByEmail(dto.email);
            if (!user) {
                throw new UnauthorizedException('Invalid credentials');
            }
            const valid = await bcrypt.compare(dto.password, user.passwordHash);
            if (!valid) {
                throw new UnauthorizedException('Invalid credentials');
            }
            const accessToken = this.createToken(user.id, user.email);
            return {
                user: this.toProfile(user),
                accessToken,
            };
        }
        async getProfile(userId) {
            const user = await this.usersService.findById(userId);
            if (!user) {
                throw new UnauthorizedException('User not found');
            }
            return this.toProfile(user);
        }
        createToken(userId, email) {
            return this.jwtService.sign({ sub: userId, email });
        }
        toProfile(user) {
            return {
                id: user.id,
                email: user.email,
                name: user.name,
                avatarUrl: user.avatarUrl,
                level: user.level,
                isAdmin: user.isAdmin,
                createdAt: user.createdAt.toISOString(),
            };
        }
    };
    __setFunctionName(_classThis, "AuthService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AuthService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AuthService = _classThis;
})();
export { AuthService };
//# sourceMappingURL=auth.service.js.map
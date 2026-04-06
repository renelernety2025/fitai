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
import { Injectable, Logger } from '@nestjs/common';
let ElevenLabsService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ElevenLabsService = _classThis = class {
        constructor() {
            this.logger = new Logger(ElevenLabsService.name);
            this.cache = new Map(); // text → audioUrl
            this.apiKey = process.env.ELEVENLABS_API_KEY || '';
            this.voiceId = process.env.ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL'; // Default multilingual voice
        }
        isAvailable() {
            return !!this.apiKey;
        }
        async synthesize(text) {
            if (!this.apiKey) {
                this.logger.warn('No ELEVENLABS_API_KEY — skipping TTS');
                return null;
            }
            // Check cache
            const cached = this.cache.get(text);
            if (cached)
                return { audioBase64: cached };
            try {
                const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${this.voiceId}`, {
                    method: 'POST',
                    headers: {
                        'xi-api-key': this.apiKey,
                        'Content-Type': 'application/json',
                        'Accept': 'audio/mpeg',
                    },
                    body: JSON.stringify({
                        text,
                        model_id: 'eleven_multilingual_v2',
                        voice_settings: {
                            stability: 0.7,
                            similarity_boost: 0.8,
                            style: 0.3,
                        },
                    }),
                });
                if (!res.ok) {
                    this.logger.error(`ElevenLabs error: ${res.status} ${await res.text()}`);
                    return null;
                }
                const buffer = Buffer.from(await res.arrayBuffer());
                const audioBase64 = buffer.toString('base64');
                // Cache short phrases (under 50 chars)
                if (text.length < 50) {
                    this.cache.set(text, audioBase64);
                    // Limit cache size
                    if (this.cache.size > 200) {
                        const firstKey = this.cache.keys().next().value;
                        if (firstKey)
                            this.cache.delete(firstKey);
                    }
                }
                return { audioBase64 };
            }
            catch (err) {
                this.logger.error(`ElevenLabs synthesis failed: ${err.message}`);
                return null;
            }
        }
        async precacheCommonPhrases() {
            const phrases = [
                'Výborně!', 'Skvělé!', 'Perfektní!', 'Super forma!',
                'Pokračuj!', 'Drž!', 'Nahoru!', 'Dolů!',
                'Set hotový!', 'Odpočinek.',
                'Pozor!', 'Narovnej záda!', 'Kolena ven!',
                'Jdeme na to!', 'Poslední rep!',
                ...Array.from({ length: 20 }, (_, i) => `${i + 1}`),
            ];
            let cached = 0;
            for (const phrase of phrases) {
                const result = await this.synthesize(phrase);
                if (result)
                    cached++;
            }
            this.logger.log(`Pre-cached ${cached}/${phrases.length} phrases`);
            return { cached, total: phrases.length };
        }
    };
    __setFunctionName(_classThis, "ElevenLabsService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ElevenLabsService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ElevenLabsService = _classThis;
})();
export { ElevenLabsService };
//# sourceMappingURL=elevenlabs.service.js.map
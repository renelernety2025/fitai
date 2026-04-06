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
import { MediaConvertClient, CreateJobCommand, } from '@aws-sdk/client-mediaconvert';
let MediaConvertService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var MediaConvertService = _classThis = class {
        constructor(prisma) {
            this.prisma = prisma;
            this.logger = new Logger(MediaConvertService.name);
            this.client = null;
            this.bucket = process.env.S3_BUCKET_VIDEOS || 'fitai-videos';
            this.roleArn = process.env.MEDIACONVERT_ROLE_ARN || '';
            this.cloudfrontUrl = process.env.CLOUDFRONT_URL || '';
            const endpoint = process.env.MEDIACONVERT_ENDPOINT;
            if (endpoint && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
                this.client = new MediaConvertClient({
                    region: process.env.AWS_REGION || 'eu-west-1',
                    endpoint,
                });
                this.logger.log('MediaConvert client initialized');
            }
            else {
                this.logger.warn('MediaConvert not configured — transcode jobs will be skipped');
            }
        }
        async createTranscodeJob(s3RawKey, videoId) {
            if (!this.client) {
                this.logger.warn(`Skipping transcode for video ${videoId} (no MediaConvert config)`);
                return { mock: true, videoId };
            }
            const input = `s3://${this.bucket}/${s3RawKey}`;
            const outputPrefix = `s3://${this.bucket}/hls/${videoId}/`;
            const command = new CreateJobCommand({
                Role: this.roleArn,
                Settings: {
                    Inputs: [
                        {
                            FileInput: input,
                            AudioSelectors: {
                                'Audio Selector 1': { DefaultSelection: 'DEFAULT' },
                            },
                        },
                    ],
                    OutputGroups: [
                        {
                            Name: 'HLS',
                            OutputGroupSettings: {
                                Type: 'HLS_GROUP_SETTINGS',
                                HlsGroupSettings: {
                                    Destination: outputPrefix,
                                    SegmentLength: 6,
                                    MinSegmentLength: 0,
                                },
                            },
                            Outputs: [
                                this.hlsOutput(640, 360, 1000000, 96000),
                                this.hlsOutput(1280, 720, 3000000, 128000),
                                this.hlsOutput(1920, 1080, 6000000, 192000),
                            ],
                        },
                    ],
                },
                UserMetadata: { videoId },
            });
            const result = await this.client.send(command);
            this.logger.log(`MediaConvert job created: ${result.Job?.Id} for video ${videoId}`);
            return result;
        }
        async handleJobComplete(videoId) {
            const hlsUrl = this.cloudfrontUrl
                ? `${this.cloudfrontUrl}/hls/${videoId}/index.m3u8`
                : `https://${this.bucket}.s3.amazonaws.com/hls/${videoId}/index.m3u8`;
            await this.prisma.video.update({
                where: { id: videoId },
                data: { hlsUrl },
            });
            this.logger.log(`Updated hlsUrl for video ${videoId}`);
        }
        async handleJobError(videoId, errorMessage) {
            this.logger.error(`MediaConvert job failed for video ${videoId}: ${errorMessage}`);
        }
        hlsOutput(width, height, bitrate, audioBitrate) {
            return {
                ContainerSettings: { Container: 'M3U8' },
                VideoDescription: {
                    Width: width,
                    Height: height,
                    CodecSettings: {
                        Codec: 'H_264',
                        H264Settings: {
                            RateControlMode: 'CBR',
                            Bitrate: bitrate,
                            MaxBitrate: bitrate,
                        },
                    },
                },
                AudioDescriptions: [
                    {
                        CodecSettings: {
                            Codec: 'AAC',
                            AacSettings: {
                                Bitrate: audioBitrate,
                                CodingMode: 'CODING_MODE_2_0',
                                SampleRate: 48000,
                            },
                        },
                    },
                ],
                NameModifier: `_${height}p`,
            };
        }
    };
    __setFunctionName(_classThis, "MediaConvertService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        MediaConvertService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return MediaConvertService = _classThis;
})();
export { MediaConvertService };
//# sourceMappingURL=mediaconvert.service.js.map
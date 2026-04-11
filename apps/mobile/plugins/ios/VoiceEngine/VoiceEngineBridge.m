//
//  VoiceEngineBridge.m
//  FitAI — React Native bridge for the VoiceEngine Swift module
//
//  Uses RCT_EXTERN_MODULE so the Swift class (annotated with @objc(VoiceEngine))
//  can be registered with React Native's module system without needing a
//  bridging header. RCTEventEmitter is declared as the parent so that
//  supportedEvents() and sendEvent(withName:body:) work correctly.
//
//  This file intentionally contains NO implementation — all logic lives in
//  VoiceEngine.swift. The Obj-C side only declares the method signatures
//  React Native needs to see at bridge registration time.
//

#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(VoiceEngine, RCTEventEmitter)

RCT_EXTERN_METHOD(play:(NSString *)base64
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(stopPlayback)

RCT_EXTERN_METHOD(startRecognition:(NSString *)lang
                  continuous:(BOOL)continuous
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(stopRecognition)

@end

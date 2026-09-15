import test from "node:test";
import assert from "node:assert/strict";
import { applyBuy, applySell, assertTrade, unrealizedPnl } from "../lib/paper-trading/calculations";
import { normalizeCandle } from "../lib/financial-data/candles";
test("weighted average cost across buys",()=>{const first=applyBuy(undefined,10,100);const second=applyBuy(first,10,120);assert.equal(second.quantity,20);assert.equal(second.averageCost,110);});
test("partial and full sells preserve cost and calculate realized pnl",()=>{const initial={quantity:20,averageCost:110,realizedPnl:0};const partial=applySell(initial,5,130);assert.deepEqual(partial,{quantity:15,averageCost:110,realizedPnl:100});const closed=applySell(partial,15,100);assert.deepEqual(closed,{quantity:0,averageCost:110,realizedPnl:-50});});
test("rejects invalid orders and insufficient resources",()=>{assert.throws(()=>assertTrade("buy",0,10,100));assert.throws(()=>assertTrade("buy",1,0,100));assert.throws(()=>assertTrade("buy",20,10,100));assert.throws(()=>assertTrade("sell",2,10,100,{quantity:1,averageCost:10,realizedPnl:0}));});
test("computes unrealized pnl without invented prices",()=>{assert.equal(unrealizedPnl({quantity:10,averageCost:100,realizedPnl:0},115),150);assert.equal(unrealizedPnl({quantity:10,averageCost:100,realizedPnl:0},Number.NaN),null);});
test("normalizes daily and intraday candle timestamps",()=>{assert.equal(normalizeCandle({time:"2026-09-14",open:1,high:3,low:.5,close:2,volume:9})?.volume,9);assert.equal(normalizeCandle({time:"2026-09-14 13:30:00",open:1,high:3,low:.5,close:2})?.close,2);assert.equal(normalizeCandle({time:"invalid",open:1,high:3,low:.5,close:2}),null);});

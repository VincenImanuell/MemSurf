/// MemSurf — on-chain anchor for cross-agent memory routing.
///
/// When the MemSurf Router agent moves a memory from one agent to another, it
/// also records the decision here on Sui. Each anchor is a permanent, ordered,
/// tamper-evident event: a third party can audit *that* a routing happened, when,
/// between which agents, and over which memory (by content digest) — independent
/// of MemWal or MemSurf's own backend.
module memsurf::routing;

use sui::event;
use sui::clock::Clock;

/// Shared registry: a single on-chain counter/witness for all routings.
public struct RoutingRegistry has key {
    id: UID,
    total: u64,
}

/// Emitted — and therefore permanently recorded on Sui — for every routing
/// decision the Router agent makes.
public struct RoutingAnchored has copy, drop {
    seq: u64,
    source: vector<u8>,
    target: vector<u8>,
    count: u64,
    digest: vector<u8>,
    timestamp_ms: u64,
}

fun init(ctx: &mut TxContext) {
    transfer::share_object(RoutingRegistry {
        id: object::new(ctx),
        total: 0,
    });
}

/// Anchor a routing decision on-chain.
/// `digest` is a caller-supplied hash of the routed memory content, so the
/// record is tamper-evident: changing the memory changes the digest.
public entry fun anchor_routing(
    registry: &mut RoutingRegistry,
    source: vector<u8>,
    target: vector<u8>,
    count: u64,
    digest: vector<u8>,
    clock: &Clock,
) {
    registry.total = registry.total + 1;
    event::emit(RoutingAnchored {
        seq: registry.total,
        source,
        target,
        count,
        digest,
        timestamp_ms: clock.timestamp_ms(),
    });
}

/// Total number of routings anchored so far.
public fun total(registry: &RoutingRegistry): u64 {
    registry.total
}

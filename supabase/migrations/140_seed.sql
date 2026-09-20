-- =====================================================================
-- 140_seed.sql (Local development & test fixtures)
-- =====================================================================

do $$
declare
  v_cycle_id uuid;
  u1 uuid := '11111111-1111-4111-a111-111111111111';
  u2 uuid := '22222222-2222-4222-a222-222222222222';
  u3 uuid := '33333333-3333-4333-a333-333333333333';
  u4 uuid := '44444444-4444-4444-a444-444444444444';
  u5 uuid := '55555555-5555-4555-a555-555555555555';
  u6 uuid := '66666666-6666-4666-a666-666666666666';
  u7 uuid := '77777777-7777-4777-a777-777777777777';
  u8 uuid := '88888888-8888-4888-a888-888888888888';

  i1 uuid := 'a1111111-1111-4111-a111-111111111111';
  i2 uuid := 'a2222222-2222-4222-a222-222222222222';
  i3 uuid := 'a3333333-3333-4333-a333-333333333333';
  i4 uuid := 'a4444444-4444-4444-a444-444444444444';
  i5 uuid := 'a5555555-5555-4555-a555-555555555555';
  i6 uuid := 'a6666666-6666-4666-a666-666666666666';
  i7 uuid := 'a7777777-7777-4777-a777-777777777777';
  i8 uuid := 'a8888888-8888-4888-a888-888888888888';
  i9 uuid := 'a9999999-9999-4999-a999-999999999999';
  i10 uuid := 'baaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa';
  i11 uuid := 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb';
  i12 uuid := 'bccccccc-cccc-4ccc-cccc-cccccccccccc';
  i13 uuid := 'bddddddd-dddd-4ddd-dddd-dddddddddddd';
  i14 uuid := 'beeeeeee-eeee-4eee-eeee-eeeeeeeeeeee';
  i15 uuid := 'bfffffff-ffff-4fff-ffff-ffffffffffff';
begin
  -- 1. Create or resolve active cycle 1
  insert into public.cycles (cycle_number, starts_at, ends_at, status, vote_threshold, daily_vote_limit, reward_slots)
  values (1, now() - interval '3 days', now() + interval '4 days', 'active', 50, 5, 3)
  on conflict (cycle_number) do update set status = 'active'
  returning id into v_cycle_id;

  -- 2. Mock auth users in auth.users if running in Supabase local
  if exists (select 1 from information_schema.tables where table_schema = 'auth' and table_name = 'users') then
    insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
    values
      (u1, 'maya@ideapulse.dev', 'dummy-hash', now() - interval '30 days', now() - interval '30 days', now()),
      (u2, 'dev@ideapulse.dev', 'dummy-hash', now() - interval '25 days', now() - interval '25 days', now()),
      (u3, 'elena@ideapulse.dev', 'dummy-hash', now() - interval '20 days', now() - interval '20 days', now()),
      (u4, 'marcus@ideapulse.dev', 'dummy-hash', now() - interval '15 days', now() - interval '15 days', now()),
      (u5, 'aisha@ideapulse.dev', 'dummy-hash', now() - interval '10 days', now() - interval '10 days', now()),
      (u6, 'sam@ideapulse.dev', 'dummy-hash', now() - interval '8 days', now() - interval '8 days', now()),
      (u7, 'chloe@ideapulse.dev', 'dummy-hash', now() - interval '5 days', now() - interval '5 days', now()),
      (u8, 'alex@ideapulse.dev', 'dummy-hash', now() - interval '2 days', now() - interval '2 days', now())
    on conflict (id) do nothing;
  end if;

  -- 3. Seed profiles
  insert into public.profiles (id, username, display_name, bio, role, status)
  values
    (u1, 'maya_chen', 'Maya Chen', 'Full-stack builder interested in local-first sync & edge DBs.', 'member', 'active'),
    (u2, 'dev_patel', 'Dev Patel', 'Product curator and open-source enthusiast.', 'member', 'active'),
    (u3, 'elena_r', 'Elena Rostova', 'Machine learning and vector search systems.', 'member', 'active'),
    (u4, 'marcus_b', 'Marcus Brody', 'Low-level systems and distributed queues.', 'member', 'active'),
    (u5, 'aisha_m', 'Aisha Al-Mansoor', 'Health tech and decentralized medical records.', 'member', 'active'),
    (u6, 'sam_becker', 'Sam Becker', 'Fintech protocols and micro-treasuries.', 'member', 'active'),
    (u7, 'chloe_d', 'Chloe Dupont', 'Climate data intelligence and carbon auditing.', 'member', 'active'),
    (u8, 'alex_thorne', 'Alex Thorne', 'IdeaPulse Community Moderator & Steward.', 'admin', 'active')
  on conflict (id) do update
    set username = excluded.username, display_name = excluded.display_name, role = excluded.role;

  -- 4. Seed 15 ideas across categories
  insert into public.ideas (id, author_id, cycle_id, title, slug, summary, body, category, tags, status, created_at)
  values
    (i1, u1, v_cycle_id, 'Offline-first sync for remote field research teams',
     'offline-first-sync-field-research-teams-a1b2c3',
     'A conflict-free replicated data protocol that lets field researchers record observations disconnected from cell signal.',
     'Field teams operating in remote ecology and disaster zones struggle with connectivity loss. This protocol implements state-based CRDTs in SQLite, merging seamlessly into Postgres upon signal recovery without manual conflicts.',
     'developer-tools', array['offline-first', 'crdt', 'sqlite'], 'published', now() - interval '2 days'),

    (i2, u3, v_cycle_id, 'Locally cached LLM inference on consumer GPUs for privacy',
     'locally-cached-llm-inference-consumer-gpus-b2c3d4',
     'Quantized on-device LLM inference engine with zero data leakage for enterprise documents.',
     'Enterprises handling sensitive medical or financial records cannot send queries to hosted model providers. This lightweight runtime executes 8-bit quantized models locally with deterministic memory footprints.',
     'ai', array['ai', 'local-llm', 'privacy'], 'published', now() - interval '2 days 6 hours'),

    (i3, u7, v_cycle_id, 'Open soil health sensor network with LoRaWAN telemetry',
     'open-soil-health-sensor-network-lorawan-c3d4e5',
     'Low-cost open hardware probe measuring moisture, nitrogen, and phosphorus with multi-mile wireless mesh.',
     'Precision agriculture should not require proprietary vendor lock-in. We provide open gerbers, firmware, and dashboard telemetry for regenerative farming monitoring.',
     'sustainability', array['hardware', 'iot', 'farming'], 'published', now() - interval '2 days 12 hours'),

    (i4, u5, v_cycle_id, 'End-to-end encrypted immunization records on passkeys',
     'encrypted-immunization-records-passkeys-d4e5f6',
     'Self-sovereign digital vaccine cards verified cryptographically without central databases.',
     'Patients should control their verifiable health records without relying on state or corporate databases that risk surveillance. Encrypted under WebAuthn public keys.',
     'health', array['health', 'passkeys', 'crypto'], 'published', now() - interval '2 days 18 hours'),

    (i5, u6, v_cycle_id, 'Automated payroll streaming for international contractors',
     'automated-payroll-streaming-contractors-e5f6a7',
     'Per-second salary streaming without bank wire delays or exorbitant currency transfer fees.',
     'Traditional cross-border banking extracts 4-7% in spreads. Real-time programmable liquidity pools allow contractors worldwide to be compensated instantly as work completes.',
     'fintech', array['fintech', 'payroll', 'global'], 'published', now() - interval '1 day 20 hours'),

    (i6, u4, v_cycle_id, 'Zero-overhead memory sanitizer for embedded rust applications',
     'zero-overhead-memory-sanitizer-embedded-rust-f6a7b8',
     'Compile-time safety verifier catching silent hardware buffer underruns in microcontrollers.',
     'Embedded firmware developers require deterministic memory guarantees without sacrificing MCU clock cycles. This tool provides formal static verification during compilation.',
     'developer-tools', array['rust', 'embedded', 'tooling'], 'published', now() - interval '1 day 16 hours'),

    (i7, u2, v_cycle_id, 'Community mesh wifi protocol for rural broadband sharing',
     'community-mesh-wifi-rural-broadband-a7b8c9',
     'Decentralized packet forwarding software converting home routers into neighborhood mesh networks.',
     'Neighborhoods with fiber access can share bandwidth with nearby unconnected households over directional radio antennas with automated fair-share throttling.',
     'social', array['mesh', 'networking', 'open-source'], 'published', now() - interval '1 day 12 hours'),

    (i8, u1, v_cycle_id, 'Interactive visual compiler pipeline debugger in the browser',
     'interactive-visual-compiler-pipeline-debugger-b8c9d0',
     'Inspect AST transformations, intermediate representations, and assembly generation step-by-step.',
     'Computer science students and systems engineers struggle to understand compiler optimizations. This interactive visual canvas demonstrates each optimization pass.',
     'education', array['compilers', 'education', 'visualization'], 'published', now() - interval '1 day 8 hours'),

    (i9, u3, v_cycle_id, 'Zero-shot synthetic training data pipeline for rare defect inspection',
     'synthetic-training-data-pipeline-defects-c9d0e1',
     'Diffusion model trained on CAD specifications to render photorealistic industrial defects for quality control.',
     'Industrial computer vision systems suffer from scarce training examples of rare manufacturing flaws. This tool synthesizes photorealistic defective parts to train vision classifiers.',
     'ai', array['computer-vision', 'synthetic-data'], 'published', now() - interval '1 day 4 hours'),

    (i10, u7, v_cycle_id, 'Distributed grid battery balancing via edge smart meters',
     'distributed-grid-battery-balancing-smart-meters-d0e1f2',
     'Peak shaving algorithm coordinating household EV batteries to prevent suburban transformer overloads.',
     'As home electrification surges, neighborhood distribution grids face thermal failure during evening peak hours. This decentralized protocol coordinates car charging schedules autonomously.',
     'sustainability', array['clean-tech', 'energy', 'smart-grid'], 'published', now() - interval '1 day'),

    (i11, u4, v_cycle_id, 'Deterministic replay debugger for distributed actor systems',
     'deterministic-replay-debugger-actor-systems-e1f2a3',
     'Record network message order and clock timestamps to reproduce flaky distributed bugs in test environments.',
     'Heisenbugs in distributed actor architectures are notorious for vanishing under inspection. By recording lightweight causal ordering vectors, bugs can be replayed deterministically.',
     'developer-tools', array['distributed-systems', 'debugging'], 'published', now() - interval '20 hours'),

    (i12, u5, v_cycle_id, 'Open prosthetic hand with compliant silicone tendons',
     'open-prosthetic-hand-compliant-silicone-f2a3b4',
     '3D printable multi-articulated bionic hand costing under 150 dollars in bill of materials.',
     'Commercial bionic prosthetics remain prohibitively expensive for most amputees. This design uses 3D printed nylon and silicone flexure joints to achieve natural grip patterns.',
     'health', array['prosthetics', '3d-printing', 'open-hardware'], 'published', now() - interval '16 hours'),

    (i13, u6, v_cycle_id, 'Cryptographic proof of reserves auditor for peer-to-peer marketplaces',
     'proof-of-reserves-auditor-p2p-marketplaces-a3b4c5',
     'Zero-knowledge solvency verifier enabling platforms to prove asset backing without leaking balances.',
     'Marketplaces holding customer escrow need to prove full solvency without revealing individual customer transaction histories. This protocol uses zk-SNARKs over Merkle state trees.',
     'fintech', array['fintech', 'zkp', 'cryptography'], 'published', now() - interval '12 hours'),

    (i14, u2, v_cycle_id, 'Minimalist distracted driving prevention dashboard for fleets',
     'distracted-driving-prevention-dashboard-fleets-b4c5d6',
     'Edge camera computer vision analyzing driver eye gaze and fatigue without storing video streams.',
     'Fleet operators must reduce driver fatigue incidents without turning vehicles into surveillance pods. The edge model computes safety telemetry while discarding raw video frames.',
     'product', array['safety', 'fleet', 'edge-ai'], 'published', now() - interval '8 hours'),

    (i15, u8, v_cycle_id, 'Universal schema converter for disparate scientific tabular datasets',
     'universal-schema-converter-scientific-datasets-c5d6e7',
     'Semantic mapping algorithm bridging non-standard CSV headers into FAIR standard ontologies.',
     'Academic research teams publish datasets with idiosyncratic column conventions, slowing meta-analyses. This tool infers semantic schema mappings automatically.',
     'education', array['data-science', 'ontology', 'open-science'], 'published', now() - interval '4 hours')
  on conflict (id) do nothing;

  -- 5. Seed ~60 votes (ensuring no self-votes and respecting one-per-user-per-idea)
  insert into public.votes (idea_id, idea_author_id, voter_id, cycle_id, is_verified, status, created_at)
  values
    -- Votes on idea 1 (Maya's idea - author u1)
    (i1, u1, u2, v_cycle_id, true, 'active', now() - interval '40 hours'),
    (i1, u1, u3, v_cycle_id, true, 'active', now() - interval '38 hours'),
    (i1, u1, u4, v_cycle_id, true, 'active', now() - interval '36 hours'),
    (i1, u1, u5, v_cycle_id, true, 'active', now() - interval '30 hours'),
    (i1, u1, u6, v_cycle_id, true, 'active', now() - interval '24 hours'),
    (i1, u1, u7, v_cycle_id, true, 'active', now() - interval '18 hours'),
    (i1, u1, u8, v_cycle_id, true, 'active', now() - interval '12 hours'),

    -- Votes on idea 2 (Elena's idea - author u3)
    (i2, u3, u1, v_cycle_id, true, 'active', now() - interval '40 hours'),
    (i2, u3, u2, v_cycle_id, true, 'active', now() - interval '38 hours'),
    (i2, u3, u4, v_cycle_id, true, 'active', now() - interval '34 hours'),
    (i2, u3, u5, v_cycle_id, true, 'active', now() - interval '28 hours'),
    (i2, u3, u6, v_cycle_id, true, 'active', now() - interval '20 hours'),
    (i2, u3, u7, v_cycle_id, true, 'active', now() - interval '14 hours'),

    -- Votes on idea 3 (Chloe's idea - author u7)
    (i3, u7, u1, v_cycle_id, true, 'active', now() - interval '36 hours'),
    (i3, u7, u2, v_cycle_id, true, 'active', now() - interval '32 hours'),
    (i3, u7, u3, v_cycle_id, true, 'active', now() - interval '28 hours'),
    (i3, u7, u4, v_cycle_id, true, 'active', now() - interval '22 hours'),
    (i3, u7, u5, v_cycle_id, true, 'active', now() - interval '16 hours'),
    (i3, u7, u6, v_cycle_id, true, 'active', now() - interval '10 hours'),
    (i3, u7, u8, v_cycle_id, true, 'active', now() - interval '6 hours'),

    -- Votes on idea 4 (Aisha's idea - author u5)
    (i4, u5, u1, v_cycle_id, true, 'active', now() - interval '35 hours'),
    (i4, u5, u2, v_cycle_id, true, 'active', now() - interval '30 hours'),
    (i4, u5, u3, v_cycle_id, true, 'active', now() - interval '25 hours'),
    (i4, u5, u4, v_cycle_id, true, 'active', now() - interval '18 hours'),
    (i4, u5, u6, v_cycle_id, true, 'active', now() - interval '12 hours'),
    (i4, u5, u7, v_cycle_id, true, 'active', now() - interval '5 hours'),

    -- Votes on idea 5 (Sam's idea - author u6)
    (i5, u6, u1, v_cycle_id, true, 'active', now() - interval '30 hours'),
    (i5, u6, u2, v_cycle_id, true, 'active', now() - interval '24 hours'),
    (i5, u6, u3, v_cycle_id, true, 'active', now() - interval '18 hours'),
    (i5, u6, u4, v_cycle_id, true, 'active', now() - interval '14 hours'),
    (i5, u6, u5, v_cycle_id, true, 'active', now() - interval '8 hours'),

    -- Votes on idea 6 (Marcus's idea - author u4)
    (i6, u4, u1, v_cycle_id, true, 'active', now() - interval '28 hours'),
    (i6, u4, u2, v_cycle_id, true, 'active', now() - interval '22 hours'),
    (i6, u4, u3, v_cycle_id, true, 'active', now() - interval '16 hours'),
    (i6, u4, u5, v_cycle_id, true, 'active', now() - interval '10 hours'),
    (i6, u4, u7, v_cycle_id, true, 'active', now() - interval '4 hours'),

    -- Votes on idea 7 (Dev's idea - author u2)
    (i7, u2, u1, v_cycle_id, true, 'active', now() - interval '25 hours'),
    (i7, u2, u3, v_cycle_id, true, 'active', now() - interval '20 hours'),
    (i7, u2, u4, v_cycle_id, true, 'active', now() - interval '15 hours'),
    (i7, u2, u6, v_cycle_id, true, 'active', now() - interval '9 hours'),

    -- Votes on idea 8 (Maya's second idea - author u1)
    (i8, u1, u2, v_cycle_id, true, 'active', now() - interval '22 hours'),
    (i8, u1, u4, v_cycle_id, true, 'active', now() - interval '16 hours'),
    (i8, u1, u5, v_cycle_id, true, 'active', now() - interval '11 hours'),
    (i8, u1, u7, v_cycle_id, true, 'active', now() - interval '5 hours'),

    -- Votes on idea 9 (Elena's second idea - author u3)
    (i9, u3, u2, v_cycle_id, true, 'active', now() - interval '20 hours'),
    (i9, u3, u4, v_cycle_id, true, 'active', now() - interval '14 hours'),
    (i9, u3, u6, v_cycle_id, true, 'active', now() - interval '8 hours'),

    -- Votes on idea 10 (Chloe's second idea - author u7)
    (i10, u7, u1, v_cycle_id, true, 'active', now() - interval '18 hours'),
    (i10, u7, u3, v_cycle_id, true, 'active', now() - interval '12 hours'),
    (i10, u7, u5, v_cycle_id, true, 'active', now() - interval '6 hours'),

    -- Votes on idea 11 (Marcus's second idea - author u4)
    (i11, u4, u1, v_cycle_id, true, 'active', now() - interval '15 hours'),
    (i11, u4, u6, v_cycle_id, true, 'active', now() - interval '7 hours'),

    -- Votes on idea 12 (Aisha's second idea - author u5)
    (i12, u5, u2, v_cycle_id, true, 'active', now() - interval '14 hours'),
    (i12, u5, u7, v_cycle_id, true, 'active', now() - interval '4 hours'),

    -- Votes on idea 13 (Sam's second idea - author u6)
    (i13, u6, u1, v_cycle_id, true, 'active', now() - interval '10 hours'),
    (i13, u6, u3, v_cycle_id, true, 'active', now() - interval '3 hours'),

    -- Votes on idea 14 (Dev's second idea - author u2)
    (i14, u2, u4, v_cycle_id, true, 'active', now() - interval '6 hours'),
    (i14, u2, u5, v_cycle_id, true, 'active', now() - interval '2 hours'),

    -- Votes on idea 15 (Alex's idea - author u8)
    (i15, u8, u1, v_cycle_id, true, 'active', now() - interval '3 hours'),
    (i15, u8, u2, v_cycle_id, true, 'active', now() - interval '1 hour')
  on conflict do nothing;

end;
$$;

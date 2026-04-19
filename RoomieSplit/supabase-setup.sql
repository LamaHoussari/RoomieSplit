-- ============================================================
-- RoomieSplit — Complete Supabase Setup
-- ============================================================
-- Run this file in your Supabase SQL Editor (Dashboard → SQL Editor)
-- to create all tables, storage buckets, RLS policies, and RPC
-- functions required by the application.
--
-- Prerequisites:
--   • A fresh Supabase project
--   • Auth → Email provider enabled (default)
--
-- After running this script, copy your project URL and anon key
-- into a .env.local file (see .env.example).
-- ============================================================


-- ============================================================
-- 1. TABLES
-- ============================================================

-- 1a. profiles — one row per authenticated user
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT        NOT NULL,
  email         TEXT        NOT NULL,
  nickname      TEXT,
  phone         TEXT,
  payment_method TEXT,
  avatar_path   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active     BOOLEAN     NOT NULL DEFAULT true,
  is_system_admin BOOLEAN   NOT NULL DEFAULT false
);

-- 1b. groups — shared living / roommate groups
CREATE TABLE IF NOT EXISTS public.groups (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL,
  code        TEXT        NOT NULL UNIQUE,
  created_by  UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  description TEXT,
  currency    TEXT        NOT NULL DEFAULT 'USD'
);

-- 1c. group_members — many-to-many between profiles and groups
CREATE TABLE IF NOT EXISTS public.group_members (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id   UUID        NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id    UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role       TEXT        NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  color_class TEXT,
  nickname   TEXT,
  joined_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (group_id, user_id)
);

-- 1d. expenses — shared expenses within a group
CREATE TABLE IF NOT EXISTS public.expenses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id    UUID        NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  description TEXT        NOT NULL,
  amount      NUMERIC     NOT NULL,
  payer_id    UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_by  UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date        TEXT        NOT NULL,          -- stored as YYYY-MM-DD string
  is_paid     BOOLEAN     NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  archived_at TIMESTAMPTZ
);

-- 1e. expense_splits — how an expense is divided among members
CREATE TABLE IF NOT EXISTS public.expense_splits (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id   UUID    NOT NULL REFERENCES public.expenses(id) ON DELETE CASCADE,
  user_id      UUID    NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  share_amount NUMERIC
);

-- 1f. settlements — records of who owes whom
CREATE TABLE IF NOT EXISTS public.settlements (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id      UUID        NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  from_user_id  UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  to_user_id    UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount        NUMERIC     NOT NULL,
  paid          NUMERIC     NOT NULL DEFAULT 0,
  created_by    UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  expense_id    UUID        REFERENCES public.expenses(id) ON DELETE SET NULL,
  archived_at   TIMESTAMPTZ
);

-- 1g. chores — shared household chores
CREATE TABLE IF NOT EXISTS public.chores (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id     UUID        NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  name         TEXT        NOT NULL,
  icon         TEXT,
  frequency    TEXT        NOT NULL,
  assigned_to  UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_by   UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_completed BOOLEAN     NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  archived_at  TIMESTAMPTZ
);


-- ============================================================
-- 2. STORAGE — profile_images bucket
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('profile_images', 'profile_images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to read profile images (public bucket)
CREATE POLICY "Public read access on profile_images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profile_images');

-- Allow authenticated users to upload their own avatar
CREATE POLICY "Authenticated users can upload their own avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'profile_images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to update (upsert) their own avatar
CREATE POLICY "Authenticated users can update their own avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'profile_images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );


-- ============================================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlements    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chores         ENABLE ROW LEVEL SECURITY;

-- ── profiles ────────────────────────────────────────────────

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Users can read profiles of fellow group members
CREATE POLICY "Users can view group members profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT gm2.user_id FROM public.group_members gm1
      JOIN public.group_members gm2 ON gm1.group_id = gm2.group_id
      WHERE gm1.user_id = auth.uid()
    )
  );

-- System admins can read all profiles
CREATE POLICY "System admins can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.is_system_admin = true
    )
  );

-- Users can insert their own profile (on signup)
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- System admins can update any profile (activate/deactivate)
CREATE POLICY "System admins can update any profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.is_system_admin = true
    )
  );

-- ── groups ──────────────────────────────────────────────────

-- Members can view their own groups
CREATE POLICY "Group members can view their groups"
  ON public.groups FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
    )
  );

-- System admins can view all groups
CREATE POLICY "System admins can view all groups"
  ON public.groups FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_system_admin = true
    )
  );

-- Authenticated users can create groups
CREATE POLICY "Authenticated users can create groups"
  ON public.groups FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Group admins can delete their groups
CREATE POLICY "Group admins can delete groups"
  ON public.groups FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_id = id AND user_id = auth.uid() AND role = 'admin'
    )
  );

-- Allow SELECT for anyone by code (needed for join_group_by_code)
CREATE POLICY "Anyone authenticated can look up group by code"
  ON public.groups FOR SELECT
  TO authenticated
  USING (true);

-- ── group_members ───────────────────────────────────────────

-- Members can view members of their own groups
CREATE POLICY "Members can view group members"
  ON public.group_members FOR SELECT
  TO authenticated
  USING (
    group_id IN (
      SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
    )
  );

-- System admins can view all group members
CREATE POLICY "System admins can view all group members"
  ON public.group_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_system_admin = true
    )
  );

-- Authenticated users can insert themselves into groups
CREATE POLICY "Users can join groups"
  ON public.group_members FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Group admins can insert other members
CREATE POLICY "Group admins can add members"
  ON public.group_members FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_id = group_members.group_id
        AND user_id = auth.uid()
        AND role = 'admin'
    )
  );

-- Group admins can update member roles
CREATE POLICY "Group admins can update members"
  ON public.group_members FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_id = group_members.group_id
        AND user_id = auth.uid()
        AND role = 'admin'
    )
  );

-- Group admins can remove members
CREATE POLICY "Group admins can delete members"
  ON public.group_members FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_id = group_members.group_id
        AND user_id = auth.uid()
        AND role = 'admin'
    )
  );

-- Members can leave a group (delete themselves)
CREATE POLICY "Members can leave groups"
  ON public.group_members FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ── expenses ────────────────────────────────────────────────

-- Group members can view expenses in their groups
CREATE POLICY "Group members can view expenses"
  ON public.expenses FOR SELECT
  TO authenticated
  USING (
    group_id IN (
      SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
    )
  );

-- System admins can view all expenses
CREATE POLICY "System admins can view all expenses"
  ON public.expenses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_system_admin = true
    )
  );

-- Group members can create expenses
CREATE POLICY "Group members can create expenses"
  ON public.expenses FOR INSERT
  TO authenticated
  WITH CHECK (
    group_id IN (
      SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
    )
  );

-- Group members can update expenses
CREATE POLICY "Group members can update expenses"
  ON public.expenses FOR UPDATE
  TO authenticated
  USING (
    group_id IN (
      SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
    )
  );

-- Group members can delete expenses
CREATE POLICY "Group members can delete expenses"
  ON public.expenses FOR DELETE
  TO authenticated
  USING (
    group_id IN (
      SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
    )
  );

-- ── expense_splits ──────────────────────────────────────────

-- Group members can view splits for expenses in their groups
CREATE POLICY "Group members can view expense splits"
  ON public.expense_splits FOR SELECT
  TO authenticated
  USING (
    expense_id IN (
      SELECT e.id FROM public.expenses e
      JOIN public.group_members gm ON e.group_id = gm.group_id
      WHERE gm.user_id = auth.uid()
    )
  );

-- Group members can create splits
CREATE POLICY "Group members can create expense splits"
  ON public.expense_splits FOR INSERT
  TO authenticated
  WITH CHECK (
    expense_id IN (
      SELECT e.id FROM public.expenses e
      JOIN public.group_members gm ON e.group_id = gm.group_id
      WHERE gm.user_id = auth.uid()
    )
  );

-- Group members can update splits
CREATE POLICY "Group members can update expense splits"
  ON public.expense_splits FOR UPDATE
  TO authenticated
  USING (
    expense_id IN (
      SELECT e.id FROM public.expenses e
      JOIN public.group_members gm ON e.group_id = gm.group_id
      WHERE gm.user_id = auth.uid()
    )
  );

-- Group members can delete splits
CREATE POLICY "Group members can delete expense splits"
  ON public.expense_splits FOR DELETE
  TO authenticated
  USING (
    expense_id IN (
      SELECT e.id FROM public.expenses e
      JOIN public.group_members gm ON e.group_id = gm.group_id
      WHERE gm.user_id = auth.uid()
    )
  );

-- ── settlements ─────────────────────────────────────────────

-- Group members can view settlements
CREATE POLICY "Group members can view settlements"
  ON public.settlements FOR SELECT
  TO authenticated
  USING (
    group_id IN (
      SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
    )
  );

-- System admins can view all settlements
CREATE POLICY "System admins can view all settlements"
  ON public.settlements FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_system_admin = true
    )
  );

-- Group members can create settlements
CREATE POLICY "Group members can create settlements"
  ON public.settlements FOR INSERT
  TO authenticated
  WITH CHECK (
    group_id IN (
      SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
    )
  );

-- Group members can update settlements
CREATE POLICY "Group members can update settlements"
  ON public.settlements FOR UPDATE
  TO authenticated
  USING (
    group_id IN (
      SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
    )
  );

-- Group members can delete settlements
CREATE POLICY "Group members can delete settlements"
  ON public.settlements FOR DELETE
  TO authenticated
  USING (
    group_id IN (
      SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
    )
  );

-- ── chores ──────────────────────────────────────────────────

-- Group members can view chores
CREATE POLICY "Group members can view chores"
  ON public.chores FOR SELECT
  TO authenticated
  USING (
    group_id IN (
      SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
    )
  );

-- System admins can view all chores
CREATE POLICY "System admins can view all chores"
  ON public.chores FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_system_admin = true
    )
  );

-- Group members can create chores
CREATE POLICY "Group members can create chores"
  ON public.chores FOR INSERT
  TO authenticated
  WITH CHECK (
    group_id IN (
      SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
    )
  );

-- Group members can update chores
CREATE POLICY "Group members can update chores"
  ON public.chores FOR UPDATE
  TO authenticated
  USING (
    group_id IN (
      SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
    )
  );

-- Group members can delete chores
CREATE POLICY "Group members can delete chores"
  ON public.chores FOR DELETE
  TO authenticated
  USING (
    group_id IN (
      SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
    )
  );


-- ============================================================
-- 4. RPC FUNCTIONS (Stored Procedures)
-- ============================================================

-- 4a. create_group_with_admin_member
-- Creates a group and adds the calling user as admin in one transaction.
CREATE OR REPLACE FUNCTION public.create_group_with_admin_member(
  p_name        TEXT,
  p_code        TEXT,
  p_description TEXT DEFAULT NULL,
  p_currency    TEXT DEFAULT 'USD'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_group_id UUID;
  v_user_id  UUID := auth.uid();
BEGIN
  INSERT INTO public.groups (name, code, created_by, description, currency)
  VALUES (p_name, p_code, v_user_id, p_description, p_currency)
  RETURNING id INTO v_group_id;

  INSERT INTO public.group_members (group_id, user_id, role)
  VALUES (v_group_id, v_user_id, 'admin');

  RETURN v_group_id;
END;
$$;

-- 4b. join_group_by_code
-- Lets the calling user join an existing group using its invite code.
CREATE OR REPLACE FUNCTION public.join_group_by_code(input_code TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_group_id UUID;
  v_user_id  UUID := auth.uid();
BEGIN
  SELECT id INTO v_group_id
  FROM public.groups
  WHERE code = input_code;

  IF v_group_id IS NULL THEN
    RAISE EXCEPTION 'Group not found for the given code.';
  END IF;

  -- Prevent duplicate membership
  IF EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = v_group_id AND user_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'You are already a member of this group.';
  END IF;

  INSERT INTO public.group_members (group_id, user_id, role)
  VALUES (v_group_id, v_user_id, 'member');

  RETURN v_group_id;
END;
$$;

-- 4c. add_group_member_by_admin
-- Allows a group admin to add another user to the group.
CREATE OR REPLACE FUNCTION public.add_group_member_by_admin(
  p_group_id UUID,
  p_user_id  UUID,
  p_role     TEXT DEFAULT 'member',
  p_nickname TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_caller UUID := auth.uid();
BEGIN
  -- Verify caller is an admin of the group
  IF NOT EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = p_group_id AND user_id = v_caller AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only group admins can add members.';
  END IF;

  -- Prevent duplicate membership
  IF EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = p_group_id AND user_id = p_user_id
  ) THEN
    RAISE EXCEPTION 'User is already a member of this group.';
  END IF;

  INSERT INTO public.group_members (group_id, user_id, role, nickname)
  VALUES (p_group_id, p_user_id, p_role, p_nickname);
END;
$$;

-- 4d. change_member_role
-- Changes a group member's role (admin ↔ member). Caller must be admin.
CREATE OR REPLACE FUNCTION public.change_member_role(
  p_member_id UUID,
  p_new_role  TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_caller   UUID := auth.uid();
  v_group_id UUID;
BEGIN
  SELECT group_id INTO v_group_id
  FROM public.group_members
  WHERE id = p_member_id;

  IF v_group_id IS NULL THEN
    RAISE EXCEPTION 'Member record not found.';
  END IF;

  -- Verify caller is an admin of the group
  IF NOT EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = v_group_id AND user_id = v_caller AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only group admins can change roles.';
  END IF;

  UPDATE public.group_members
  SET role = p_new_role
  WHERE id = p_member_id;
END;
$$;

-- 4e. create_expense_with_splits
-- Atomically creates an expense together with its splits and settlements.
CREATE OR REPLACE FUNCTION public.create_expense_with_splits(
  p_group_id    UUID,
  p_description TEXT,
  p_amount      NUMERIC,
  p_payer_id    UUID,
  p_date        TEXT,
  p_is_paid     BOOLEAN DEFAULT false,
  p_splits      JSONB DEFAULT '[]'::JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_expense_id UUID;
  v_caller     UUID := auth.uid();
  v_split      JSONB;
  v_split_user UUID;
  v_split_amt  NUMERIC;
BEGIN
  -- Create the expense
  INSERT INTO public.expenses (group_id, description, amount, payer_id, created_by, date, is_paid)
  VALUES (p_group_id, p_description, p_amount, p_payer_id, v_caller, p_date, p_is_paid)
  RETURNING id INTO v_expense_id;

  -- Create the splits
  FOR v_split IN SELECT * FROM jsonb_array_elements(p_splits)
  LOOP
    v_split_user := (v_split->>'user_id')::UUID;
    v_split_amt  := (v_split->>'share_amount')::NUMERIC;

    INSERT INTO public.expense_splits (expense_id, user_id, share_amount)
    VALUES (v_expense_id, v_split_user, v_split_amt);

    -- Auto-create settlement if splitter is not the payer
    IF v_split_user <> p_payer_id AND v_split_amt > 0 THEN
      INSERT INTO public.settlements (group_id, from_user_id, to_user_id, amount, paid, created_by, expense_id)
      VALUES (p_group_id, v_split_user, p_payer_id, v_split_amt, 0, v_caller, v_expense_id);
    END IF;
  END LOOP;

  RETURN v_expense_id;
END;
$$;

-- 4f. update_expense_with_splits
-- Updates an expense and recalculates its splits and settlements.
CREATE OR REPLACE FUNCTION public.update_expense_with_splits(
  p_expense_id  UUID,
  p_description TEXT DEFAULT NULL,
  p_amount      NUMERIC DEFAULT NULL,
  p_payer_id    UUID DEFAULT NULL,
  p_date        TEXT DEFAULT NULL,
  p_is_paid     BOOLEAN DEFAULT NULL,
  p_splits      JSONB DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_group_id   UUID;
  v_payer_id   UUID;
  v_caller     UUID := auth.uid();
  v_split      JSONB;
  v_split_user UUID;
  v_split_amt  NUMERIC;
BEGIN
  -- Get current expense data
  SELECT group_id, payer_id INTO v_group_id, v_payer_id
  FROM public.expenses
  WHERE id = p_expense_id;

  IF v_group_id IS NULL THEN
    RAISE EXCEPTION 'Expense not found.';
  END IF;

  -- Use new payer if provided, else keep existing
  IF p_payer_id IS NOT NULL THEN
    v_payer_id := p_payer_id;
  END IF;

  -- Update expense fields (only non-null parameters)
  UPDATE public.expenses SET
    description = COALESCE(p_description, description),
    amount      = COALESCE(p_amount, amount),
    payer_id    = COALESCE(p_payer_id, payer_id),
    date        = COALESCE(p_date, date),
    is_paid     = COALESCE(p_is_paid, is_paid)
  WHERE id = p_expense_id;

  -- If new splits are provided, replace old splits and settlements
  IF p_splits IS NOT NULL THEN
    DELETE FROM public.expense_splits WHERE expense_id = p_expense_id;
    DELETE FROM public.settlements    WHERE expense_id = p_expense_id;

    FOR v_split IN SELECT * FROM jsonb_array_elements(p_splits)
    LOOP
      v_split_user := (v_split->>'user_id')::UUID;
      v_split_amt  := (v_split->>'share_amount')::NUMERIC;

      INSERT INTO public.expense_splits (expense_id, user_id, share_amount)
      VALUES (p_expense_id, v_split_user, v_split_amt);

      IF v_split_user <> v_payer_id AND v_split_amt > 0 THEN
        INSERT INTO public.settlements (group_id, from_user_id, to_user_id, amount, paid, created_by, expense_id)
        VALUES (v_group_id, v_split_user, v_payer_id, v_split_amt, 0, v_caller, p_expense_id);
      END IF;
    END LOOP;
  END IF;
END;
$$;

-- 4g. record_settlement_payment
-- Records a partial or full payment against a settlement.
CREATE OR REPLACE FUNCTION public.record_settlement_payment(
  p_settlement_id UUID,
  p_amount        NUMERIC
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_paid NUMERIC;
  v_total        NUMERIC;
BEGIN
  SELECT paid, amount INTO v_current_paid, v_total
  FROM public.settlements
  WHERE id = p_settlement_id;

  IF v_total IS NULL THEN
    RAISE EXCEPTION 'Settlement not found.';
  END IF;

  IF v_current_paid + p_amount > v_total THEN
    RAISE EXCEPTION 'Payment exceeds remaining balance.';
  END IF;

  UPDATE public.settlements
  SET paid = paid + p_amount
  WHERE id = p_settlement_id;
END;
$$;

-- 4h. sync_expense_settlements
-- Regenerates settlement records from an expense's splits.
CREATE OR REPLACE FUNCTION public.sync_expense_settlements(p_expense_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_group_id UUID;
  v_payer_id UUID;
  v_caller   UUID := auth.uid();
  v_split    RECORD;
BEGIN
  SELECT group_id, payer_id INTO v_group_id, v_payer_id
  FROM public.expenses
  WHERE id = p_expense_id;

  IF v_group_id IS NULL THEN
    RAISE EXCEPTION 'Expense not found.';
  END IF;

  -- Remove existing settlements for this expense
  DELETE FROM public.settlements WHERE expense_id = p_expense_id;

  -- Recreate from splits
  FOR v_split IN
    SELECT user_id, share_amount
    FROM public.expense_splits
    WHERE expense_id = p_expense_id
  LOOP
    IF v_split.user_id <> v_payer_id AND COALESCE(v_split.share_amount, 0) > 0 THEN
      INSERT INTO public.settlements (group_id, from_user_id, to_user_id, amount, paid, created_by, expense_id)
      VALUES (v_group_id, v_split.user_id, v_payer_id, v_split.share_amount, 0, v_caller, p_expense_id);
    END IF;
  END LOOP;
END;
$$;

-- 4i. admin_set_user_active
-- System admin can activate or deactivate a user account.
CREATE OR REPLACE FUNCTION public.admin_set_user_active(
  p_user_id  UUID,
  p_is_active BOOLEAN
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_caller UUID := auth.uid();
BEGIN
  -- Verify caller is a system admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = v_caller AND is_system_admin = true
  ) THEN
    RAISE EXCEPTION 'Only system admins can perform this action.';
  END IF;

  UPDATE public.profiles
  SET is_active = p_is_active
  WHERE id = p_user_id;
END;
$$;

-- 4j. admin_archive_group
-- System admin can archive an entire group and all its related records.
CREATE OR REPLACE FUNCTION public.admin_archive_group(p_group_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_caller UUID := auth.uid();
  v_now    TIMESTAMPTZ := now();
BEGIN
  -- Verify caller is a system admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = v_caller AND is_system_admin = true
  ) THEN
    RAISE EXCEPTION 'Only system admins can perform this action.';
  END IF;

  -- Archive all expenses in the group
  UPDATE public.expenses
  SET archived_at = v_now
  WHERE group_id = p_group_id AND archived_at IS NULL;

  -- Archive all settlements in the group
  UPDATE public.settlements
  SET archived_at = v_now
  WHERE group_id = p_group_id AND archived_at IS NULL;

  -- Archive all chores in the group
  UPDATE public.chores
  SET archived_at = v_now
  WHERE group_id = p_group_id AND archived_at IS NULL;
END;
$$;


-- ============================================================
-- 5. GRANT EXECUTE ON RPC FUNCTIONS
-- ============================================================
-- These grants allow the authenticated role (used by the anon
-- key + logged-in JWTs) to call each function via supabase.rpc().

GRANT EXECUTE ON FUNCTION public.create_group_with_admin_member    TO authenticated;
GRANT EXECUTE ON FUNCTION public.join_group_by_code                TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_group_member_by_admin         TO authenticated;
GRANT EXECUTE ON FUNCTION public.change_member_role                TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_expense_with_splits        TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_expense_with_splits        TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_settlement_payment         TO authenticated;
GRANT EXECUTE ON FUNCTION public.sync_expense_settlements          TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_user_active             TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_archive_group               TO authenticated;


-- ============================================================
-- 6. INDEXES (performance)
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_group_members_group_id  ON public.group_members (group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id   ON public.group_members (user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_group_id       ON public.expenses (group_id);
CREATE INDEX IF NOT EXISTS idx_expense_splits_expense   ON public.expense_splits (expense_id);
CREATE INDEX IF NOT EXISTS idx_settlements_group_id    ON public.settlements (group_id);
CREATE INDEX IF NOT EXISTS idx_settlements_expense_id  ON public.settlements (expense_id);
CREATE INDEX IF NOT EXISTS idx_chores_group_id         ON public.chores (group_id);
CREATE INDEX IF NOT EXISTS idx_groups_code             ON public.groups (code);

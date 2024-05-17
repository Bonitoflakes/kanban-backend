CREATE OR REPLACE FUNCTION update_card_order(
  cid BIGINT,
  new_order INT,
  old_column_id BIGINT,
  new_column_id BIGINT
)
RETURNS VOID
AS $$
DECLARE
    old_order INT;
BEGIN
    -- Get the old list order for the card
    SELECT "order" INTO old_order
    FROM cards
    WHERE cards.id = cid AND column_id = old_column_id;

    -- Update the order for cards in the same column
    IF new_column_id = old_column_id THEN
        -- Moving within the same column
        IF new_order < old_order THEN -- Moving up
            UPDATE cards
            SET "order" = "order" + 1
            WHERE ("order" BETWEEN new_order AND (old_order - 1)) AND column_id = old_column_id;
        ELSE -- Moving down
            UPDATE cards
            SET "order" = "order" - 1
            WHERE ("order" BETWEEN  (old_order + 1) AND new_order) AND column_id = old_column_id;
        END IF;
    ELSE
        -- Moving to a new column, decrement old column cards.order
        UPDATE cards
        SET "order" = "order" - 1
        WHERE column_id = old_column_id AND "order" > old_order;
    END IF;

    -- Update the order for cards in the new column
    IF new_column_id <> old_column_id THEN
        UPDATE cards
        SET "order" = "order" + 1
        WHERE column_id = new_column_id AND "order" >= new_order;
    END IF;

    -- Update the card's column and order
    UPDATE cards
    SET column_id = new_column_id, "order" = new_order
    WHERE cards.id = cid;
END;
$$
LANGUAGE plpgsql;
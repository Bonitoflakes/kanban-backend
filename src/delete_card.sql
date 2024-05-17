CREATE OR REPLACE FUNCTION delete_card(id BIGINT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    deleted_order INT;
    deleted_column_id BIGINT;
BEGIN
    -- Get the order and column_id of the deleted card
    SELECT "order", column_id INTO deleted_order, deleted_column_id
    FROM cards
    WHERE cards.id = delete_card.id;

    -- Delete the card
    DELETE FROM cards
    WHERE cards.id = delete_card.id;

    -- Update the order for remaining cards in the same column
    UPDATE cards
    SET "order" = "order" - 1
    WHERE cards.column_id = deleted_column_id
    AND "order" > deleted_order;
END;
$$;

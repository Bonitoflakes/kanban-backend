CREATE OR REPLACE FUNCTION delete_column(id BIGINT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    deleted_order INT;
BEGIN
    -- Get the order of the deleted column.
    SELECT "order" INTO deleted_order
    FROM columns
    WHERE columns.id = delete_column.id;

    -- Delete the column
    DELETE FROM columns
    WHERE columns.id = delete_column.id;

    -- Update the order for the remaining columns in the same board.
    UPDATE columns
    SET "order" = "order" - 1
    WHERE "order" > deleted_order;

END;
$$;

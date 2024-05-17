CREATE OR REPLACE FUNCTION update_column_order(cid BIGINT, new_order INT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    old_order INT;
BEGIN
    SELECT "order" INTO old_order
    FROM columns
    WHERE columns.id = cid;

    IF new_order != old_order THEN
    -- Move up
        IF new_order < old_order THEN
            UPDATE columns
            SET "order" = "order" + 1
            where "order" between new_order and (old_order - 1);
        ELSE
    -- Move down
            UPDATE columns
            SET "order" = "order" - 1
            WHERE "order" between  (old_order + 1) and new_order;
        END IF;

        UPDATE columns
        SET "order" = new_order
        WHERE columns.id = cid;
    END IF;
END;
$$;

-- 创建触发器函数
CREATE OR REPLACE FUNCTION notify_hotel_change() RETURNS TRIGGER AS
$$
DECLARE
    payload json;
BEGIN
    IF TG_OP = 'INSERT' THEN
        payload := json_build_object(
            'op', 'insert',
            'id', NEW.id
        );
    ELSIF TG_OP = 'UPDATE' THEN
        payload := json_build_object(
            'op', 'update',
            'id', NEW.id
        );
    ELSIF TG_OP = 'DELETE' THEN
        payload := json_build_object(
            'op', 'delete',
            'id', OLD.id
        );
    END IF;

    PERFORM pg_notify('hotel_table_change', payload::text);
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 为表创建触发器
CREATE TRIGGER watched_table_trigger
    AFTER INSERT OR UPDATE OR DELETE
    ON "Hotel"
    FOR EACH ROW
EXECUTE PROCEDURE notify_hotel_change();




-- 创建触发器函数
CREATE OR REPLACE FUNCTION notify_room_inventory() RETURNS TRIGGER AS
$$
DECLARE
    payload json;
BEGIN
    IF TG_OP = 'INSERT' THEN
        payload := json_build_object(
            'op', 'insert',
            'id', NEW.id
        );
    ELSIF TG_OP = 'UPDATE' THEN
        payload := json_build_object(
            'op', 'update',
            'id', NEW.id
        );
    ELSIF TG_OP = 'DELETE' THEN
        payload := json_build_object(
            'op', 'delete',
            'id', OLD.id
        );
    END IF;

    PERFORM pg_notify('notify_room_inventory', payload::text);
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 为表创建触发器
CREATE TRIGGER watched_table_trigger
    AFTER INSERT OR UPDATE OR DELETE
    ON "RoomInventory"
    FOR EACH ROW
EXECUTE PROCEDURE notify_room_inventory();

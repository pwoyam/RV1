-- اضافه کردن context و waiting_for به tasks
-- این‌ها از قبل توی migration اول هستن، پس فقط ایندکس می‌سازیم
CREATE INDEX IF NOT EXISTS idx_tasks_context ON tasks(context);
CREATE INDEX IF NOT EXISTS idx_tasks_waiting_for ON tasks(waiting_for);

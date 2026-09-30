"""Change datetime columns.

Revision ID: 0f80c6c72d26
Revises: 83f58c049203
Create Date: 2026-09-30 13:33:14.003823

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.orm import Session
from datetime import timezone
from zoneinfo import ZoneInfo

# revision identifiers, used by Alembic.
revision = '0f80c6c72d26'
down_revision = '83f58c049203'
branch_labels = None
depends_on = None


def upgrade():
    # 1. Bind to the active database connection to alter data first
    bind = op.get_bind()
    session = Session(bind=bind)

    # Reflect the items table properties
    metadata = sa.MetaData()
    items_table = sa.Table('items', metadata, autoload_with=bind)

    # 2. Fetch all existing records with their naive created_at timestamps
    records = session.execute(
        sa.select(items_table.c.id, items_table.c.created_at)
    ).all()
    
    pacific_tz = ZoneInfo("America/Los_Angeles")

    # 3. Loop through every row and mathematically shift the Pacific times to UTC
    for record_id, naive_pacific_dt in records:
        if naive_pacific_dt is not None:
            # Tag the naive time as Pacific (automatically figures out historical PST vs PDT)
            localized_pacific = naive_pacific_dt.replace(tzinfo=pacific_tz)
            
            # Shift the timezone timeline parameters fully into UTC coordinates
            utc_aware_dt = localized_pacific.astimezone(timezone.utc)
            
            # Save the fixed UTC timestamp back down to the row
            session.execute(
                sa.update(items_table)
                .where(items_table.c.id == record_id)
                .values(created_at=utc_aware_dt)
            )
            
    session.commit()

    # 4. Now that data is updated, structurally alter BOTH columns to handle timezones
    with op.batch_alter_table('items', schema=None) as batch_op:
        # Step A: Upgrade roblox_upload_date from VARCHAR to DateTime(timezone=True)
        batch_op.alter_column('roblox_upload_date',
               existing_type=sa.VARCHAR(length=50),
               type_=sa.DateTime(timezone=True),
               existing_nullable=True)
               
        # Step B: Upgrade created_at from naive DateTime to DateTime(timezone=True)
        batch_op.alter_column('created_at',
               existing_type=sa.DateTime(timezone=False),
               type_=sa.DateTime(timezone=True),
               existing_nullable=True) # Change to False if your created_at column is strictly required


def downgrade():
    bind = op.get_bind()
    session = Session(bind=bind)
    metadata = sa.MetaData()
    items_table = sa.Table('items', metadata, autoload_with=bind)
    records = session.execute(sa.select(items_table.c.id, items_table.c.created_at)).all()
    pacific_tz = ZoneInfo("America/Los_Angeles")

    # Shift UTC data back to naive Pacific for fallback
    for record_id, utc_dt in records:
        if utc_dt is not None:
            if utc_dt.tzinfo is None:
                utc_dt = utc_dt.replace(tzinfo=timezone.utc)
            pacific_dt = utc_dt.astimezone(pacific_tz)
            naive_pacific = pacific_dt.replace(tzinfo=None)
            session.execute(sa.update(items_table).where(items_table.c.id == record_id).values(created_at=naive_pacific))
    session.commit()

    with op.batch_alter_table('items', schema=None) as batch_op:
        batch_op.alter_column('created_at',
               existing_type=sa.DateTime(timezone=True),
               type_=sa.DateTime(timezone=False),
               existing_nullable=True)

        batch_op.alter_column('roblox_upload_date',
               existing_type=sa.DateTime(timezone=True),
               type_=sa.VARCHAR(length=50),
               existing_nullable=True)

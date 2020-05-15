from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    discord_id = Column(String)
    last_fm = Column(String)
    points = Column(Integer)
    def __repr__(self):
        return f"<User id={self.discord_id}"




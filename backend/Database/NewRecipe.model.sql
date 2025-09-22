create database RECIPE;
use RECIPE;
create table info(
RecipeId int,
Name varchar(2000),
Description TEXT,
RecipeIngredientQuantities TEXT,
RecipeIngredientParts TEXT,
RecipeInstructions TEXT
);
SET GLOBAL local_infile = 1;

LOAD DATA LOCAL INFILE 'C:/Users/santo/OneDrive/Desktop/recipes_dbms.csv'
INTO TABLE info
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\r\n'
IGNORE 1 ROWS;
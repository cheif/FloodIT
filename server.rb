require 'sinatra'
require 'haml'
require 'json'
require 'dm-core'
require 'dm-validations'
require 'dm-migrations'
require 'dm-timestamps'

configure :production do
	DataMapper.setup(:default, ENV['DATABASE_URL'])
end
configure :development do
	DataMapper.setup(:default, ENV['DATABASE_URL'] || "sqlite3://#{Dir.pwd}/flood.sqlite3")
end

class Player
	include DataMapper::Resource
	property :id,		Serial
	property :name,	String

	def self.status(uid)
		name = get(uid).name
		games = Game.all(:uid => uid)
		wingames = Game.all(:uid => uid, :totalpoints.gt => 0)
		{'name' => name, 'games' => games.length, 'wingames' => wingames.length}.to_json
	end

	def self.list
		raw = all()
		players = []
		raw.each{|player|
			players.push({'id' => player.id, 'name' => player.name})
		}
		players.to_json
	end

end

class Game
	include DataMapper::Resource

	property :id,		Serial
	property :uid,	Integer
	property :clicks,	Integer
	property :totalpoints,	Integer
	property :time,	DateTime

	def self.highscore
		raw = all(:fields => [:uid, :totalpoints], :unique => true, :order => [:totalpoints.desc])[0..9]
		highscore = []
		raw.each{|game|
			highscore.push({'player' => Player.get(game.uid).name, 'score' => game.totalpoints});
		}
		highscore.to_json
	end
end

DataMapper.auto_upgrade!

get '/' do
	haml :index
end

get '/newGame' do
	# Generate new board
	board = []
	196.times {|i| board.push({'x' => i%14, 'y' => i/14.floor, 'value' => rand(6)})}
	board.to_json
end

get '/endGame/:uid/:clicks/:totalpoints' do
	# Saves a game
	@game = Game.create(:uid => params[:uid], :clicks => params[:clicks], :totalpoints => params[:totalpoints], :time => Time.now)
end

get '/highscore' do
	# Loads 10 highest scores
	Game.highscore
end

get '/status/:id' do
	# Return current player status
	Player.status(params[:id])
end

get '/players' do
	# Return list of players
	Player.list
end

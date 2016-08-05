class PositionController < ApplicationController
  def index
  end

  def pos
    render json: {y: rand(1..100), z: rand(1..100)}
  end
end

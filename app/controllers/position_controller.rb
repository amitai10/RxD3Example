class PositionController < ApplicationController
  def index
  end

  def pos
    x = params[:x].to_i
    y = params[:y].to_i
    if [true, false].sample
      x += 10 if x < 100
    else
      x -= 10 if x > 0
    end
    if [true, false].sample
      y += 10 if y < 100
    else
      y -= 10 if y > 0
    end
    x
    render json: {x: x, y: y}
  end
end

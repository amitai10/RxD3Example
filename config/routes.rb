Rails.application.routes.draw do
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html

  root 'position#index'

  get 'position', to: 'position#pos'
  get 'ball', to: 'ball#index'
end

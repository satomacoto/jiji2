# coding: utf-8

require 'jiji/configurations/mongoid_configuration'
require 'jiji/utils/value_object'
require 'jiji/errors/errors'
require 'jiji/web/transport/transportable'

module Jiji::Model::Agents
class AgentSource

  include Mongoid::Document
  include Jiji::Web::Transport::Transportable
  include Jiji::Errors
  
  store_in collection: "agent_sources"
  
  field :name,          type: String
  field :memo,          type: String
  field :type,          type: Symbol
  field :status,        type: Symbol
  field :body,          type: String
  
  field :created_at,    type: Time
  field :updated_at,    type: Time
  
  attr_readonly :type, :created_at
  attr_reader :error, :context
  
  index(
    { :updated_at => 1, :id=> 1 }, 
    { unique: true, name: "agent_sources_updated_at_id_index" })
  index(
    { :type=> 1, :name =>1, :id=> 1 }, 
    { unique: true, name: "agent_sources_type_name_id_index" })
  
  def self.create( name, type, created_at, memo="", body="" )
    source = AgentSource.new{|a|
      a.name       = name
      a.type       = type
      a.created_at = created_at
      a.updated_at = created_at
      a.memo       = memo
      a.body       = body
    }
    source.evaluate
    source.save
    source
  end
  
  def update( name, updated_at, memo, body )
    self.name       = name       || self.name
    self.memo       = memo       || self.memo
    self.body       = body       || self.body
    self.updated_at = updated_at || self.updated_at
    evaluate
    save
  end
  
  def evaluate
    self.status = body.empty? ? :empty : :normal
    @error  = nil
    return if body.empty?
    @context = Context.new_context
    begin
      @context.module_eval( body, "#{type}/#{name}", 1 )
    rescue Exception => e
      self.status = :error
      @error  = e.to_s
    end
    return @context
  end
  
end
end
import { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';

interface ChessBoardProps {
  fen: string;
  onMove?: (move: any) => void;
  orientation?: 'white' | 'black';
  draggable?: boolean;
}

const ChessboardAny = Chessboard as any;

export default function ChessBoard({ fen, onMove, orientation = 'white', draggable = true }: ChessBoardProps) {
  const [game, setGame] = useState(new Chess(fen));

  useEffect(() => {
    setGame(new Chess(fen));
  }, [fen]);

  function makeAMove(move: any) {
    const gameCopy = new Chess(game.fen());
    try {
      const result = gameCopy.move(move);
      if (result) {
        setGame(gameCopy);
        if (onMove) onMove(result);
        return result;
      }
    } catch (e) {
      return null;
    }
    return null;
  }

  function onDrop(sourceSquare: string, targetSquare: string) {
    const move = makeAMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q', // always promote to queen for simplicity
    });

    if (move === null) return false;
    return true;
  }

  return (
    <div className="w-full max-w-[600px] aspect-square">
      <ChessboardAny 
        position={game.fen()} 
        onPieceDrop={onDrop} 
        boardOrientation={orientation}
        arePiecesDraggable={draggable}
      />
    </div>
  );
}
